import { Slideover } from "../../base-components/Headless";
import Button from "../../base-components/Button";
import Lucide from "../../base-components/Lucide";
import activities from "../../fakers/activities";
import clsx from "clsx";
import _ from "lodash";

interface MainProps {
  notificationsPanel: boolean;
  setNotificationsPanel: (val: boolean) => void;
}

function Main(props: MainProps) {
  return (
    <div>
      <Slideover
        open={props.notificationsPanel}
        onClose={() => {
          props.setNotificationsPanel(false);
        }}
      >
        <Slideover.Panel className="w-72 rounded-[0.75rem_0_0_0.75rem/1.1rem_0_0_1.1rem]">
          <a
            href=""
            className="focus:outline-none hover:bg-white/10 bg-white/5 transition-all hover:rotate-180 absolute inset-y-0 left-0 right-auto flex items-center justify-center my-auto -ml-[60px] sm:-ml-[105px] border rounded-full text-white/90 w-8 h-8 sm:w-14 sm:h-14 border-white/90 hover:scale-105"
            onClick={(e) => {
              e.preventDefault();
              props.setNotificationsPanel(false);
            }}
          >
            <Lucide className="w-8 h-8 stroke-[1]" icon="X" />
          </a>
          <Slideover.Title className="px-6 py-5">
            <h2 className="mr-auto text-base font-medium">Notifications</h2>
            <Button variant="outline-secondary" className="hidden sm:flex">
              <Lucide icon="ShieldCheck" className="w-4 h-4 mr-2" /> Mark all as
              read
            </Button>
          </Slideover.Title>
          <Slideover.Description className="p-0">
            <div className="flex flex-col p-3 gap-0.5">
              {activities.fakeActivities().map((faker, fakerKey) => (
                <a
                  href=""
                  key={fakerKey}
                  className="flex items-center px-3 py-2.5 rounded-xl hover:bg-slate-100/80"
                >
                  <div
                    className={clsx([
                      "group hidden sm:flex items-center justify-center w-10 h-10 border rounded-full",
                      "[&.primary]:border-primary/10 [&.primary]:bg-primary/10",
                      "[&.success]:border-success/10 [&.success]:bg-success/10",
                      "[&.info]:border-info/10 [&.info]:bg-info/10",
                      ["primary", "success", "info"][_.random(0, 2)],
                    ])}
                  >
                    {_.random(0, 1) ? (
                      <Lucide
                        icon="HardDrive"
                        className={clsx([
                          "w-5 h-5",
                          "group-[.primary]:text-primary group-[.primary]:fill-primary/10",
                          "group-[.success]:text-success group-[.success]:fill-success/10",
                          "group-[.info]:text-info group-[.info]:fill-info/10",
                        ])}
                      />
                    ) : (
                      <Lucide
                        icon="HardDriveUpload"
                        className={clsx([
                          "w-5 h-5",
                          "group-[.primary]:text-primary group-[.primary]:fill-primary/10",
                          "group-[.success]:text-success group-[.success]:fill-success/10",
                          "group-[.info]:text-info group-[.info]:fill-info/10",
                        ])}
                      />
                    )}
                  </div>
                  <div className="sm:ml-4">
                    <div className="font-medium">{faker.activity}</div>
                    <div className="text-slate-500 mt-0.5">
                      {faker.activityDetails}
                    </div>
                    {faker.images && (
                      <div className="w-40 sm:w-56 my-3.5 p-1 border rounded-[0.6rem] bg-slate-50/80">
                        <div className="grid grid-cols-3 overflow-hidden rounded-[0.6rem]">
                          <div className="h-12 sm:h-16 overflow-hidden border image-fit border-slate-100 saturate-[.6] hover:saturate-100 cursor-pointer">
                            <img
                              alt="Tailwise - Admin Dashboard Template"
                              src={faker.images[0]}
                            />
                          </div>
                          <div className="h-12 sm:h-16 overflow-hidden border image-fit border-slate-100 saturate-[.6] hover:saturate-100 cursor-pointer">
                            <img
                              alt="Tailwise - Admin Dashboard Template"
                              src={faker.images[1]}
                            />
                          </div>
                          <div className="h-12 sm:h-16 overflow-hidden border image-fit border-slate-100 saturate-[.6] hover:saturate-100 cursor-pointer">
                            <img
                              alt="Tailwise - Admin Dashboard Template"
                              src={faker.images[2]}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-1.5 text-xs text-slate-500">
                      {faker.date}
                    </div>
                  </div>
                  {_.random(0, 1) == 1 && (
                    <div className="flex-none w-2 h-2 ml-auto border rounded-full bg-primary/30 border-primary/30"></div>
                  )}
                </a>
              ))}
            </div>
          </Slideover.Description>
        </Slideover.Panel>
      </Slideover>
    </div>
  );
}

export default Main;
