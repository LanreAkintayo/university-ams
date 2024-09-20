import _ from "lodash";
import products, { type Product } from "./products";
import { icons } from "../base-components/Lucide";

interface PerformanceInsight {
  title: string;
  subtitle: string;
  icon: keyof typeof icons;
  images: Product["images"];
  link: string;
}

const fakers = {
  fakePerformanceInsights() {
    const performanceInsights: Array<PerformanceInsight> = [
      {
        title: "Top 10 Laboratory Equipment",
        subtitle: "Frequently used lab tools",
        icon: "Microscope",
        images: products.fakeProducts()[0].images,
        link: "Explore Lab Equipment",
      },
      {
        title: "Top 5 Dept Products",
        subtitle: "Popular departmental resources",
        icon: "Briefcase",
        images: products.fakeProducts()[0].images,
        link: "Explore Dept Products",
      },
      {
        title: "Recently Acquired Products",
        subtitle: "Newly acquired items",
        icon: "Package",
        images: products.fakeProducts()[0].images,
        link: "View New Products",
      },
      {
        title: "Maintenance Alerts",
        subtitle: "Products needing maintenance",
        icon: "Wrench",
        images: products.fakeProducts()[0].images,
        link: "View Maintenance",
      },
      // {
      //   title: "Underutilized Resources",
      //   subtitle: "Low utilization products",
      //   icon: "Wrench",
      //   images: products.fakeProducts()[0].images,
      //   link: "Explore Resources",
      // },
      {
        title: "Classroom Essentials",
        subtitle: "Commonly used classroom items",
        icon: "BookOpen",
        images: products.fakeProducts()[0].images,
        link: "Explore Essentials",
      },
      {
        title: "Admin Office Resources",
        subtitle: "Administrative tools & resources",
        icon: "Clipboard",
        images: products.fakeProducts()[0].images,
        link: "Explore Admin Tools",
      },
    ];

    return _.shuffle(performanceInsights);
  },
};

export default fakers;
