import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { MultiImageUploader } from '@/components/shared/multi-image-uploader';
import { SeoManageNote } from '@/components/shared/seo-manage-note';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useProduct, useCreateProduct, useUpdateProduct } from './products-api';
import { useCategoryOptions } from '@/features/categories/categories-api';
import { useSubCategoryOptions } from '@/features/subcategories/subcategories-api';
import { SpecificationsEditor } from './specifications-editor';
import { RelatedProductsPicker } from './related-products-picker';
import { RelatedBlogsPicker } from './related-blogs-picker';
import { ProductFaqEditor } from './product-faq-editor';
import { productFormSchema, PRODUCT_FORM_DEFAULTS, type ProductFormValues } from './product-form-schema';
import type { MediaAsset } from '@/types/common';
import type { RelatedProductRef, RelatedBlogRef, ProductFaqItem } from '@/types/product';

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: product, isLoading: isLoadingProduct } = useProduct(id);
  const { data: categoryOptions, isLoading: isLoadingCategories } = useCategoryOptions();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(id ?? '');

  const [images, setImages] = useState<MediaAsset[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductRef[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlogRef[]>([]);
  const [faqs, setFaqs] = useState<ProductFaqItem[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: PRODUCT_FORM_DEFAULTS,
  });

  const selectedCategoryId = watch('category');
  const { data: subCategoryOptions, isLoading: isLoadingSubCategories } =
    useSubCategoryOptions(selectedCategoryId || undefined);

  const categoryField = register('category');

  useEffect(() => {
    if (!product) return;
    reset({
      category: product.category?._id ?? '',
      subCategories: product.subCategories?.map((s) => s._id) ?? [],
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      specifications: product.specifications ?? [],
      price: product.price,
      discountPrice: product.discountPrice ?? '',
      sku: product.sku ?? '',
      stockStatus: product.stockStatus ?? 'made_to_order',
      displayOrder: product.displayOrder,
      status: product.status,
      isFeatured: product.isFeatured,
    });
    setImages(product.images ?? []);
    setRelatedProducts(product.relatedProducts ?? []);
    setRelatedBlogs(product.relatedBlogs ?? []);
    setFaqs(product.faqs ?? []);
  }, [product, reset]);

  async function onSubmit(values: ProductFormValues) {
    const payload = {
      category: values.category,
      subCategories: values.subCategories,
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      images,
      specifications: values.specifications,
      price: values.price,
      discountPrice: values.discountPrice === '' ? null : values.discountPrice,
      sku: values.sku || undefined,
      stockStatus: values.stockStatus,
      displayOrder: values.displayOrder,
      status: values.status,
      isFeatured: values.isFeatured,
      relatedProducts: relatedProducts.map((p) => p._id),
      relatedBlogs: relatedBlogs.map((b) => b._id),
      faqs,
    };

    try {
      if (isEditMode) {
        await updateProduct.mutateAsync(payload);
        toast.success('Product updated');
      } else {
        await createProduct.mutateAsync(payload);
        toast.success('Product created');
      }
      navigate('/products');
    } catch (error) {
      toast.error(isEditMode ? "Couldn't update product" : "Couldn't create product", getErrorMessage(error));
    }
  }

  if (isEditMode && isLoadingProduct) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-espresso"
      >
        <ArrowLeft size={15} />
        Back to products
      </Link>

      <PageHeader title={isEditMode ? 'Edit Product' : 'New Product'} />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  className="mt-1.5"
                  disabled={isLoadingCategories}
                  {...categoryField}
                  onChange={(event) => {
                    categoryField.onChange(event);
                    setValue('subCategories', []);
                  }}
                >
                  <option value="">Select a category</option>
                  {categoryOptions?.items.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
                {errors.category && <p className="mt-1 text-xs text-rust">{errors.category.message}</p>}
              </div>
              <div>
                <Label>Subcategories</Label>
                <Controller
                  control={control}
                  name="subCategories"
                  render={({ field }) => (
                    <div className="mt-1.5 max-h-40 overflow-y-auto rounded-md border border-ink-muted/20 p-2">
                      {!selectedCategoryId ? (
                        <p className="text-xs text-ink-muted">Select a category first</p>
                      ) : isLoadingSubCategories ? (
                        <p className="text-xs text-ink-muted">Loading…</p>
                      ) : !subCategoryOptions?.items.length ? (
                        <p className="text-xs text-ink-muted">No subcategories under this category</p>
                      ) : (
                        subCategoryOptions.items.map((option) => {
                          const checked = field.value.includes(option._id);
                          return (
                            <label
                              key={option._id}
                              className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-black/5"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  field.onChange(
                                    checked
                                      ? field.value.filter((v) => v !== option._id)
                                      : [...field.value, option._id],
                                  );
                                }}
                              />
                              {option.name}
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                />
                {errors.subCategories && (
                  <p className="mt-1 text-xs text-rust">{errors.subCategories.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" className="mt-1.5" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-rust">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" className="mt-1.5" placeholder="auto-generated from name" {...register('slug')} />
              {errors.slug && <p className="mt-1 text-xs text-rust">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" className="mt-1.5" rows={4} {...register('description')} />
            </div>

            <MultiImageUploader label="Images" value={images} onChange={setImages} folder="products" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing &amp; inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" min={0} step="0.01" className="mt-1.5" {...register('price')} />
                {errors.price && <p className="mt-1 text-xs text-rust">{errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="discountPrice">Discount price (₹)</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Optional"
                  className="mt-1.5"
                  {...register('discountPrice')}
                />
                {errors.discountPrice && (
                  <p className="mt-1 text-xs text-rust">{errors.discountPrice.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="Optional" className="mt-1.5" {...register('sku')} />
              </div>
              <div>
                <Label htmlFor="stockStatus">Stock status</Label>
                <Select id="stockStatus" className="mt-1.5" {...register('stockStatus')}>
                  <option value="made_to_order">Made to order</option>
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <SpecificationsEditor control={control} register={register} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related products</CardTitle>
            <p className="mt-1 text-xs text-ink-muted">
              Optional — leave empty and the product page automatically shows other active products from the same category instead.
            </p>
          </CardHeader>
          <CardContent>
            <RelatedProductsPicker
              value={relatedProducts}
              onChange={setRelatedProducts}
              excludeProductId={id}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related blog posts</CardTitle>
            <p className="mt-1 text-xs text-ink-muted">
              Optional — leave empty and the product page automatically shows the most recently published blog posts instead.
            </p>
          </CardHeader>
          <CardContent>
            <RelatedBlogsPicker value={relatedBlogs} onChange={setRelatedBlogs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <p className="mt-1 text-xs text-ink-muted">
              Optional — leave empty and a generic set of furniture FAQs (customization, delivery, warranty, care) is shown instead.
            </p>
          </CardHeader>
          <CardContent>
            <ProductFaqEditor value={faqs} onChange={setFaqs} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select id="status" className="mt-1.5" {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="displayOrder">Display order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min={0}
                  className="mt-1.5"
                  {...register('displayOrder')}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <Switch id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="isFeatured">Feature on homepage</Label>
            </div>
          </CardContent>
        </Card>

        <SeoManageNote searchTerm={product?.slug} />

        <div className="flex justify-end gap-2">
          <Link to="/products" className={buttonVariants({ variant: 'secondary' })}>
            Cancel
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="text-current" />}
            {isEditMode ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
