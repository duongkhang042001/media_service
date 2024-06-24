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
exports.AppLink = void 0;
const core_1 = require("@mikro-orm/core");
let AppLink = class AppLink {
    constructor() {
        this.createTime = new Date();
        this.updateTime = new Date();
    }
};
__decorate([
    core_1.PrimaryKey(),
    __metadata("design:type", Number)
], AppLink.prototype, "id", void 0);
__decorate([
    core_1.Property({ unique: true }),
    core_1.Index(),
    __metadata("design:type", String)
], AppLink.prototype, "name", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], AppLink.prototype, "iosLink", void 0);
__decorate([
    core_1.Property({ nullable: true }),
    __metadata("design:type", String)
], AppLink.prototype, "androidLink", void 0);
__decorate([
    core_1.Property({ defaultRaw: 'now' }),
    core_1.Index(),
    __metadata("design:type", Date)
], AppLink.prototype, "createTime", void 0);
__decorate([
    core_1.Property({ defaultRaw: 'now', onUpdate: () => new Date() }),
    __metadata("design:type", Date)
], AppLink.prototype, "updateTime", void 0);
AppLink = __decorate([
    core_1.Entity()
], AppLink);
exports.AppLink = AppLink;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWxpbmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZW50aXRpZXMvYXBwLWxpbmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMENBQW1FO0FBR25FLElBQWEsT0FBTyxHQUFwQixNQUFhLE9BQU87SUFBcEI7UUFnQkksZUFBVSxHQUFTLElBQUksSUFBSSxFQUFFLENBQUE7UUFHN0IsZUFBVSxHQUFTLElBQUksSUFBSSxFQUFFLENBQUE7SUFDakMsQ0FBQztDQUFBLENBQUE7QUFsQkc7SUFEQyxpQkFBVSxFQUFFOzttQ0FDRjtBQUlYO0lBRkMsZUFBUSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDO0lBQ3hCLFlBQUssRUFBRTs7cUNBQ0s7QUFHYjtJQURDLGVBQVEsQ0FBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQzs7d0NBQ1g7QUFHaEI7SUFEQyxlQUFRLENBQUMsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUM7OzRDQUNQO0FBSXBCO0lBRkMsZUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBQyxDQUFDO0lBQzdCLFlBQUssRUFBRTs4QkFDSSxJQUFJOzJDQUFhO0FBRzdCO0lBREMsZUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFBQyxDQUFDOzhCQUM5QyxJQUFJOzJDQUFhO0FBbkJwQixPQUFPO0lBRG5CLGFBQU0sRUFBRTtHQUNJLE9BQU8sQ0FvQm5CO0FBcEJZLDBCQUFPIn0=