import Lucide from "../../base-components/Lucide";
import { Menu } from "../../base-components/Headless";
import TinySlider, {
  TinySliderElement,
} from "../../base-components/TinySlider";
import { getColor } from "../../utils/colors";
import ReportLineChart from "../../components/ReportLineChart";
import ReportDonutChart3 from "../../components/ReportDonutChart3";
import Pagination from "../../base-components/Pagination";
import { FormSelect } from "../../base-components/Form";
import Tippy from "../../base-components/Tippy";
import eCommerce from "../../fakers/e-commerce";
import transactions from "../../fakers/transactions";
import Button from "../../base-components/Button";
import Litepicker from "../../base-components/Litepicker";
import Table from "../../base-components/Table";
import { useState, useRef } from "react";
import clsx from "clsx";
import _ from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

function Main() {
  const [generalReportFilter, setGeneralReportFilter] = useState<string>();
  const sliderRef = useRef<TinySliderElement>();
  const prevImportantNotes = () => {
    sliderRef.current?.tns.goTo("prev");
  };
  const nextImportantNotes = () => {
    sliderRef.current?.tns.goTo("next");
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6">
      <div className="col-span-12">
        <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium group-[.mode--light]:text-white">
            General Report
          </div>
          <div className="flex flex-col sm:flex-row gap-x-3 gap-y-2 md:ml-auto">
            <div className="relative">
              <Lucide
                icon="CalendarCheck2"
                className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
              />
              <FormSelect className="sm:w-44 rounded-[0.5rem] group-[.mode--light]:bg-chevron-white group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent pl-9">
                <option value="custom-date">Custom Date</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </FormSelect>
            </div>
            <div className="relative">
              <Lucide
                icon="Calendar"
                className="absolute group-[.mode--light]:!text-slate-200 inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3 stroke-[1.3]"
              />
              <Litepicker
                value={generalReportFilter}
                onChange={setGeneralReportFilter}
                options={{
                  autoApply: false,
                  singleMode: false,
                  numberOfColumns: 2,
                  numberOfMonths: 2,
                  showWeekNumbers: true,
                  dropdowns: {
                    minYear: 1990,
                    maxYear: null,
                    months: true,
                    years: true,
                  },
                }}
                className="pl-9 sm:w-64 rounded-[0.5rem] group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200 group-[.mode--light]:!border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row w-full gap-5 mt-3.5">
          <div className="p-1 lg:w-4/12 box box--stacked">
            <div className="-mx-1 overflow-hidden h-[244px] [&_.tns-nav]:bottom-auto [&_.tns-nav]:w-auto [&_.tns-nav]:ml-5 [&_.tns-nav]:mt-5 [&_.tns-nav_button]:w-2 [&_.tns-nav_button]:h-2 [&_.tns-nav_button.tns-nav-active]:w-5 [&_.tns-nav_button]:mx-0.5 [&_.tns-nav_button]:bg-white/40 [&_.tns-nav_button.tns-nav-active]:bg-white/70">
              <TinySlider options={{ mode: "gallery", nav: true }}>
                <div className="px-1">
                  <div className="overflow-hidden relative flex flex-col w-full h-full p-5 rounded-[0.5rem] bg-gradient-to-b from-theme-2/90 to-theme-1/[0.85]">
                    <Lucide
                      icon="Medal"
                      className="absolute top-0 right-0 w-36 h-36 -mt-5 -mr-5 text-white/20 fill-white/[0.03] transform rotate-[-10deg] stroke-[0.3]"
                    />
                    <div className="mt-12 mb-9">
                      <div className="text-2xl font-medium leading-snug text-white">
                        New feature
                        <br />
                        unlocked!
                      </div>
                      <div className="mt-1.5 text-lg text-white/70">
                        Boost your performance!
                      </div>
                    </div>
                    <a
                      className="flex items-center font-medium text-white"
                      href=""
                    >
                      Upgrade now
                      <Lucide icon="MoveRight" className="w-4 h-4 ml-1.5" />
                    </a>
                  </div>
                </div>
                <div className="px-1">
                  <div className="overflow-hidden relative flex flex-col w-full h-full p-5 rounded-[0.5rem] bg-gradient-to-b from-theme-2/90 to-theme-1/90">
                    <Lucide
                      icon="Database"
                      className="absolute top-0 right-0 w-36 h-36 -mt-5 -mr-5 text-white/20 fill-white/[0.03] transform rotate-[-10deg] stroke-[0.3]"
                    />
                    <div className="mt-12 mb-9">
                      <div className="text-2xl font-medium leading-snug text-white">
                        Stay ahead
                        <br />
                        with upgrades
                      </div>
                      <div className="mt-1.5 text-lg text-white/70">
                        New features and updates!
                      </div>
                    </div>
                    <a
                      className="flex items-center font-medium text-white"
                      href=""
                    >
                      Discover now
                      <Lucide icon="ArrowRight" className="w-4 h-4 ml-1.5" />
                    </a>
                  </div>
                </div>
                <div className="px-1">
                  <div className="overflow-hidden relative flex flex-col w-full h-full p-5 rounded-[0.5rem] bg-gradient-to-b from-theme-2/90 to-theme-1/90">
                    <Lucide
                      icon="Gauge"
                      className="absolute top-0 right-0 w-36 h-36 -mt-5 -mr-5 text-white/20 fill-white/[0.03] transform rotate-[-10deg] stroke-[0.3]"
                    />
                    <div className="mt-12 mb-9">
                      <div className="text-2xl font-medium leading-snug text-white">
                        Supercharge
                        <br />
                        your workflow
                      </div>
                      <div className="mt-1.5 text-lg text-white/70">
                        Boost performance!
                      </div>
                    </div>
                    <a
                      className="flex items-center font-medium text-white"
                      href=""
                    >
                      Get started
                      <Lucide icon="ArrowRight" className="w-4 h-4 ml-1.5" />
                    </a>
                  </div>
                </div>
              </TinySlider>
            </div>
          </div>
          <div className="flex lg:w-4/12 flex-col p-5 box box--stacked">
            <Menu className="absolute top-0 right-0 mt-5 mr-5">
              <Menu.Button className="w-5 h-5 text-slate-500">
                <Lucide
                  icon="MoreVertical"
                  className="w-6 h-6 stroke-slate-400/70 fill-slate-400/70"
                />
              </Menu.Button>
              <Menu.Items className="w-40">
                <Menu.Item>
                  <Lucide icon="Copy" className="w-4 h-4 mr-2" /> Copy Link
                </Menu.Item>
                <Menu.Item>
                  <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                  Delete
                </Menu.Item>
              </Menu.Items>
            </Menu>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full border-primary/10 bg-primary/10">
                <Lucide
                  icon="Database"
                  className="w-6 h-6 text-primary fill-primary/10"
                />
              </div>
              <div className="ml-4">
                <div className="text-base font-medium">
                  15 Assets Registered
                </div>
                <div className="text-slate-500 mt-0.5">
                  Across all divisions
                </div>
              </div>
            </div>
            <div className="relative mt-5 mb-6 overflow-hidden">
              <div className="absolute inset-0 h-px my-auto tracking-widest text-slate-400/60 whitespace-nowrap leading-[0] text-xs">
                .......................................................................
              </div>
              <ReportLineChart
                className="relative z-10 -ml-1.5"
                height={100}
                index={2}
                borderColor={getColor("primary")}
                backgroundColor={getColor("primary", 0.3)}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-5">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary/70"></div>
                <div className="ml-2.5">Assets Registered</div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <div className="ml-2.5">Divisions</div>
              </div>
            </div>
          </div>
          <div className="flex lg:w-4/12 flex-col p-5 box box--stacked">
            <Menu className="absolute top-0 right-0 mt-5 mr-5">
              <Menu.Button className="w-5 h-5 text-slate-500">
                <Lucide
                  icon="MoreVertical"
                  className="w-6 h-6 stroke-slate-400/70 fill-slate-400/70"
                />
              </Menu.Button>
              <Menu.Items className="w-40">
                <Menu.Item>
                  <Lucide icon="Copy" className="w-4 h-4 mr-2" /> Copy Link
                </Menu.Item>
                <Menu.Item>
                  <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                  Delete
                </Menu.Item>
              </Menu.Items>
            </Menu>
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 border rounded-full border-success/10 bg-success/10">
                <Lucide
                  icon="Files"
                  className="w-6 h-6 text-success fill-success/10"
                />
              </div>
              <div className="ml-4">
                <div className="text-base font-medium">5 Assets Allocated</div>
                <div className="text-slate-500 mt-0.5">
                  Across all divisions
                </div>
              </div>
            </div>
            <div className="relative mt-5 mb-6 overflow-hidden">
              <div className="absolute inset-0 h-px my-auto tracking-widest text-slate-400/60 whitespace-nowrap leading-[0] text-xs">
                .......................................................................
              </div>
              <ReportLineChart
                className="relative z-10 -ml-1.5"
                height={100}
                index={0}
                borderColor={getColor("success")}
                backgroundColor={getColor("success", 0.3)}
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-5">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-success/70"></div>
                <div className="ml-2.5">Total Allocated</div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                <div className="ml-2.5">Divisions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12">
        <div className="flex flex-col md:h-10 gap-y-3 md:items-center md:flex-row">
          <div className="text-base font-medium">Performance Insights</div>
          <div className="flex gap-x-3 gap-y-2 md:ml-auto">
            <Button
              data-carousel="important-notes"
              data-target="prev"
              className="rounded-[0.5rem] bg-white text-slate-600 dark:text-slate-300"
              onClick={prevImportantNotes}
            >
              <div className="flex items-center justify-center w-3.5 h-5">
                <Lucide icon="ChevronLeft" className="w-4 h-4" />
              </div>
            </Button>
            <Button
              data-carousel="important-notes"
              data-target="next"
              className="rounded-[0.5rem] bg-white text-slate-600 dark:text-slate-300"
              onClick={nextImportantNotes}
            >
              <div className="flex items-center justify-center w-3.5 h-5">
                <Lucide icon="ChevronRight" className="w-4 h-4" />
              </div>
            </Button>
          </div>
        </div>
        <div className="mt-3.5 -mx-2.5">
          <TinySlider
            options={{
              autoplay: false,
              controls: false,
              items: 1,
              responsive: {
                640: { items: 2 },
                768: { items: 3 },
                1024: { items: 4 },
                1320: {
                  items: 5,
                },
              },
            }}
            getRef={(el) => {
              sliderRef.current = el;
            }}
          >
            {eCommerce.fakePerformanceInsights().map((faker, fakerKey) => (
              <div className="px-2.5 pb-3" key={fakerKey}>
                <div className="relative p-5 box box--stacked">
                  <div className="flex items-center">
                    <div
                      className={clsx([
                        "group flex items-center justify-center w-10 h-10 border rounded-full",
                        "[&.primary]:border-primary/10 [&.primary]:bg-primary/10",
                        "[&.success]:border-success/10 [&.success]:bg-success/10",
                        ["primary", "success"][_.random(0, 1)],
                      ])}
                    >
                      <Lucide
                        icon={faker.icon}
                        className={clsx([
                          "w-5 h-5",
                          "group-[.primary]:text-primary group-[.primary]:fill-primary/10",
                          "group-[.success]:text-success group-[.success]:fill-success/10",
                        ])}
                      />
                    </div>
                    <div className="flex ml-auto">
                      <div className="w-8 h-8 image-fit zoom-in">
                        <img
                          alt="Tailwise - Admin Dashboard Template"
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={faker.images[0].path}
                        />
                      </div>
                      <div className="w-8 h-8 -ml-3 image-fit zoom-in">
                        <img
                          alt="Tailwise - Admin Dashboard Template"
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={faker.images[1].path}
                        />
                      </div>
                      <div className="w-8 h-8 -ml-3 image-fit zoom-in">
                        <img
                          alt="Tailwise - Admin Dashboard Template"
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={faker.images[2].path}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-11">
                    <div className="text-base font-medium">{faker.title}</div>
                    <div className="text-slate-500 mt-0.5">
                      {faker.subtitle}
                    </div>
                  </div>
                  <a
                    className="flex items-center pt-4 mt-4 font-medium border-t border-dashed text-primary"
                    href=""
                  >
                    {faker.link}
                    <Lucide icon="ArrowRight" className="w-4 h-4 ml-1.5" />
                  </a>
                </div>
              </div>
            ))}
          </TinySlider>
        </div>
      </div>
    </div>
  );
}

export default Main;
