import _ from "lodash";
import { icons } from "../base-components/Lucide";

export interface Category {
  name: string;
  icon: keyof typeof icons;
  tags: string[];
  slug: string;
  isActive: boolean;
}


const computerLab = {
  labCategories() {
    const categories: Array<Category> = [
      {
        name: "Hardware",
        icon: "Laptop",
        tags: ["Computers", "Input Devices", "Storage Devices"],
        slug: "hardware",
        isActive: true,
      },
      {
        name: "Software",
        icon: "Shirt",
        tags: ["office suites", "security software", "development tools"],
        slug: "software",
        isActive: true,
      },
      {
        name: "Accessories",
        icon: "DoorOpen",
        tags: ["Mounts and Stands", "Peripherals"],
        slug: "accessories",
        isActive: false,
      },
      {
        name: "Furniture & Ergonomics",
        icon: "Gamepad2",
        tags: ["Desks & Chairs", "Lighting"],
        slug: "furniture-ergonomics",
        isActive: true,
      },
      {
        name: "Educational Resources",
        icon: "Book",
        tags: ["Books and Manuals", "Tutorial Videos"],
        slug: "educational-resources",
        isActive: true,
      },
    ];
    return categories;
  },
};

export default computerLab;