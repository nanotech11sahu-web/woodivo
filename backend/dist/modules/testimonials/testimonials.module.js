"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const testimonial_schema_1 = require("./schemas/testimonial.schema");
const testimonials_service_1 = require("./testimonials.service");
const testimonials_controller_1 = require("./testimonials.controller");
const testimonials_admin_controller_1 = require("./testimonials.admin.controller");
let TestimonialsModule = class TestimonialsModule {
};
exports.TestimonialsModule = TestimonialsModule;
exports.TestimonialsModule = TestimonialsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: testimonial_schema_1.Testimonial.name, schema: testimonial_schema_1.TestimonialSchema },
            ]),
        ],
        controllers: [testimonials_controller_1.TestimonialsController, testimonials_admin_controller_1.TestimonialsAdminController],
        providers: [testimonials_service_1.TestimonialsService],
        exports: [mongoose_1.MongooseModule, testimonials_service_1.TestimonialsService],
    })
], TestimonialsModule);
//# sourceMappingURL=testimonials.module.js.map