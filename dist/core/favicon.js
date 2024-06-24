"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavIconRoute = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FavIconRoute = async function (fastify, opts) {
    let faviconBuf;
    try {
        faviconBuf = fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'favicon.ico'));
    }
    catch {
    }
    fastify.get('/favicon.ico', async (req, res) => {
        if (faviconBuf) {
            res.header('Content-Type', 'image/x-icon');
            res.send(faviconBuf);
        }
        else {
            res.code(404);
            res.send();
        }
    });
};
exports.FavIconRoute = FavIconRoute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF2aWNvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2Zhdmljb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsNENBQW1CO0FBQ25CLGdEQUF1QjtBQUdoQixNQUFNLFlBQVksR0FBRyxLQUFLLFdBQVcsT0FBd0IsRUFBRSxJQUFJO0lBQ3RFLElBQUksVUFBa0IsQ0FBQTtJQUN0QixJQUFJO1FBQ0EsVUFBVSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQTtLQUN4RTtJQUFDLE1BQU07S0FDUDtJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDM0MsSUFBSSxVQUFVLEVBQUU7WUFDWixHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQTtZQUMxQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ3ZCO2FBQU07WUFDSCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQ2IsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO1NBQ2I7SUFDTCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTtBQWhCWSxRQUFBLFlBQVksZ0JBZ0J4QiJ9