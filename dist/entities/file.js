"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const core_1 = require("@mikro-orm/core");
let File = class File {
    constructor() {
        this.createTime = new Date();
        this.updateTime = new Date();
    }
};
File.tableName = 'File';
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", String)
], File.prototype, "id", void 0);
__decorate([
    core_1.Property(),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "name", void 0);
__decorate([
    core_1.Property({ default: 'default' }),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "folder", void 0);
__decorate([
    core_1.Property({ unsigned: true, default: 0 }),
    __metadata("design:type", Number)
], File.prototype, "size", void 0);
__decorate([
    core_1.Property({ default: 'application/octet-stream' }),
    __metadata("design:type", String)
], File.prototype, "mimeType", void 0);
__decorate([
    core_1.Property({ defaultRaw: 'now' }),
    core_1.Index(),
    __metadata("design:type", Date)
], File.prototype, "createTime", void 0);
__decorate([
    core_1.Property({ defaultRaw: 'now', onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], File.prototype, "updateTime", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    core_1.Index(),
    __metadata("design:type", String)
], File.prototype, "googleDriveFileId", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", Date)
], File.prototype, "googleDriveUploadTime", void 0);
File = __decorate([
    core_1.Entity()
], File);
exports.File = File;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9lbnRpdGllcy9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDBDQUFtRTtBQUduRSxJQUFhLElBQUksR0FBakIsTUFBYSxJQUFJO0lBQWpCO1FBc0JJLGVBQVUsR0FBUyxJQUFJLElBQUksRUFBRSxDQUFBO1FBRzdCLGVBQVUsR0FBUyxJQUFJLElBQUksRUFBRSxDQUFBO0lBUWpDLENBQUM7Q0FBQSxDQUFBO0FBaENVLGNBQVMsR0FBRyxNQUFNLENBQUE7QUFHekI7SUFEQyxpQkFBVSxFQUFFOztnQ0FDRjtBQUlYO0lBRkMsZUFBUSxFQUFFO0lBQ1YsWUFBSyxFQUFFOztrQ0FDSztBQUliO0lBRkMsZUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFBQyxDQUFDO0lBQzlCLFlBQUssRUFBRTs7b0NBQ087QUFHZjtJQURDLGVBQVEsQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBQyxDQUFDOztrQ0FDMUI7QUFHYjtJQURDLGVBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBRSwwQkFBMEIsRUFBQyxDQUFDOztzQ0FDL0I7QUFJakI7SUFGQyxlQUFRLENBQUMsRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDN0IsWUFBSyxFQUFFOzhCQUNJLElBQUk7d0NBQWE7QUFHN0I7SUFEQyxlQUFRLENBQUMsRUFBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFDLENBQUM7OEJBQzlDLElBQUk7d0NBQWE7QUFJN0I7SUFGQyxlQUFRLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7SUFDMUIsWUFBSyxFQUFFOzsrQ0FDa0I7QUFHMUI7SUFEQyxlQUFRLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7OEJBQ0gsSUFBSTttREFBQTtBQWhDbkIsSUFBSTtJQURoQixhQUFNLEVBQUU7R0FDSSxJQUFJLENBaUNoQjtBQWpDWSxvQkFBSSJ9