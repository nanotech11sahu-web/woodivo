import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/shared/page-header';
import { ImageUploader } from '@/components/shared/image-uploader';
import { SeoManageNote } from '@/components/shared/seo-manage-note';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/lib/toast';
import { getErrorMessage } from '@/lib/http-error';
import { useAboutPage, useUpdateAboutPage } from './about-api';
import { ValuesEditor } from './values-editor';
import { MilestonesEditor } from './milestones-editor';
import { TeamMembersEditor } from './team-members-editor';
import {
  aboutFormSchema,
  ABOUT_FORM_DEFAULTS,
  type AboutFormValues,
} from './about-form-schema';
import type { MediaAsset } from '@/types/common';

/** Same reasoning as settings-page.tsx's orUndefined — every field here is
 * IsOptional/IsString on the backend, so sending `undefined` over `''` just
 * keeps the payload clean. */
function orUndefined(value: string | undefined): string | undefined {
  return value ? value : undefined;
}

export function AboutPageEditor() {
  const { data: about, isLoading } = useAboutPage();
  const updateAbout = useUpdateAboutPage();

  const [heroImage, setHeroImage] = useState<MediaAsset | undefined>();
  const [storyImage, setStoryImage] = useState<MediaAsset | undefined>();
  const [teamPhotos, setTeamPhotos] = useState<(MediaAsset | undefined)[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AboutFormValues>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: ABOUT_FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!about) return;
    reset({
      heroTitle: about.heroTitle ?? '',
      heroSubtitle: about.heroSubtitle ?? '',
      storyTitle: about.storyTitle ?? '',
      storyContent: about.storyContent ?? '',
      missionText: about.missionText ?? '',
      visionText: about.visionText ?? '',
      values: about.values ?? [],
      milestones: about.milestones ?? [],
      teamTitle: about.teamTitle ?? '',
      teamSubtitle: about.teamSubtitle ?? '',
      teamMembers: (about.teamMembers ?? []).map(({ name, role, bio }) => ({
        name,
        role,
        bio: bio ?? '',
      })),
      ctaTitle: about.ctaTitle ?? '',
      ctaText: about.ctaText ?? '',
    });
    setHeroImage(about.heroImage);
    setStoryImage(about.storyImage);
    setTeamPhotos((about.teamMembers ?? []).map((member) => member.photo));
  }, [about, reset]);

  async function onSubmit(values: AboutFormValues) {
    const payload = {
      heroTitle: orUndefined(values.heroTitle),
      heroSubtitle: orUndefined(values.heroSubtitle),
      heroImage,
      storyTitle: orUndefined(values.storyTitle),
      storyContent: orUndefined(values.storyContent),
      storyImage,
      missionText: orUndefined(values.missionText),
      visionText: orUndefined(values.visionText),
      values: values.values,
      milestones: values.milestones.map((milestone) => ({
        ...milestone,
        description: orUndefined(milestone.description),
      })),
      teamTitle: orUndefined(values.teamTitle),
      teamSubtitle: orUndefined(values.teamSubtitle),
      teamMembers: values.teamMembers.map((member, index) => ({
        ...member,
        bio: orUndefined(member.bio),
        photo: teamPhotos[index],
      })),
      ctaTitle: orUndefined(values.ctaTitle),
      ctaText: orUndefined(values.ctaText),
    };

    try {
      await updateAbout.mutateAsync(payload);
      toast.success('About page saved');
    } catch (error) {
      toast.error("Couldn't save About page", getErrorMessage(error));
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="About Page"
        description="Hero, story, mission & vision, values, milestones and team content shown on the public /about page."
      />

      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader label="Hero image" value={heroImage} onChange={setHeroImage} folder="about" />
            <div>
              <Label htmlFor="heroTitle">Title</Label>
              <Input id="heroTitle" className="mt-1.5" {...register('heroTitle')} />
              {errors.heroTitle && (
                <p className="mt-1 text-xs text-rust">{errors.heroTitle.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Subtitle</Label>
              <Textarea id="heroSubtitle" rows={2} className="mt-1.5" {...register('heroSubtitle')} />
              {errors.heroSubtitle && (
                <p className="mt-1 text-xs text-rust">{errors.heroSubtitle.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader label="Story image" value={storyImage} onChange={setStoryImage} folder="about" />
            <div>
              <Label htmlFor="storyTitle">Title</Label>
              <Input id="storyTitle" className="mt-1.5" {...register('storyTitle')} />
            </div>
            <div>
              <Label htmlFor="storyContent">Content</Label>
              <Textarea id="storyContent" rows={6} className="mt-1.5" {...register('storyContent')} />
              {errors.storyContent && (
                <p className="mt-1 text-xs text-rust">{errors.storyContent.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission & Vision</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="missionText">Mission</Label>
              <Textarea id="missionText" rows={4} className="mt-1.5" {...register('missionText')} />
            </div>
            <div>
              <Label htmlFor="visionText">Vision</Label>
              <Textarea id="visionText" rows={4} className="mt-1.5" {...register('visionText')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Values</CardTitle>
          </CardHeader>
          <CardContent>
            <ValuesEditor control={control} register={register} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <MilestonesEditor control={control} register={register} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="teamTitle">Section title</Label>
                <Input id="teamTitle" className="mt-1.5" {...register('teamTitle')} />
              </div>
              <div>
                <Label htmlFor="teamSubtitle">Section subtitle</Label>
                <Input id="teamSubtitle" className="mt-1.5" {...register('teamSubtitle')} />
              </div>
            </div>
            <TeamMembersEditor
              control={control}
              register={register}
              photos={teamPhotos}
              onPhotosChange={setTeamPhotos}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call to Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-ink-muted">
              Leave blank to use the site's default "Have something in mind?" copy.
            </p>
            <div>
              <Label htmlFor="ctaTitle">Title</Label>
              <Input id="ctaTitle" className="mt-1.5" {...register('ctaTitle')} />
            </div>
            <div>
              <Label htmlFor="ctaText">Text</Label>
              <Textarea id="ctaText" rows={2} className="mt-1.5" {...register('ctaText')} />
            </div>
          </CardContent>
        </Card>

        <SeoManageNote searchTerm="About" />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner className="text-current" />}
          Save About Page
        </Button>
      </form>
    </div>
  );
}
