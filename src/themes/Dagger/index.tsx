import { Transition } from "react-transition-group";
import Breadcrumb from "../../base-components/Breadcrumb";
import { useState, useEffect, createRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { selectSideMenu, selectSideMenuUser } from "../../stores/sideMenuSlice";
import {
  selectCompactMenu,
  setCompactMenu as setCompactMenuStore,
} from "../../stores/compactMenuSlice";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { FormattedMenu, linkTo, nestedMenu, enter, leave } from "./side-menu";
import Lucide from "../../base-components/Lucide";
import users from "../../fakers/users";
import clsx from "clsx";
import SimpleBar from "simplebar";
import { Menu } from "../../base-components/Headless";
import QuickSearch from "../../components/QuickSearch";
import SwitchAccount from "../../components/SwitchAccount";
import NotificationsPanel from "../../components/NotificationsPanel";
import ActivitiesPanel from "../../components/ActivitiesPanel";
// import WalletConnect from "../../components/WalletConnect";
import { useSelector } from "react-redux";
import { RootState } from "../../stores/store";

function Main() {
  const dispatch = useAppDispatch();
  const compactMenu = useAppSelector(selectCompactMenu);
  const setCompactMenu = (val: boolean) => {
    localStorage.setItem("compactMenu", val.toString());
    dispatch(setCompactMenuStore(val));
  };
  const [quickSearch, setQuickSearch] = useState(false);
  const [switchAccount, setSwitchAccount] = useState(false);
  const [notificationsPanel, setNotificationsPanel] = useState(false);
  const [activitiesPanel, setActivitiesPanel] = useState(false);
  const [compactMenuOnHover, setCompactMenuOnHover] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [formattedMenu, setFormattedMenu] = useState<
    Array<FormattedMenu | string>
  >([]);

  const [isAdmin, setIsAdmin] = useState(() => {
    // Load user from local storage if available
    const isAnAdmin = localStorage.getItem('isAdmin');
    return isAnAdmin ? JSON.parse(isAnAdmin) : null;
  })




  const sideMenuStore = isAdmin === "true" ? useAppSelector(selectSideMenu):  useAppSelector(selectSideMenuUser)
  // const sideMenuUserStore = useAppSelector(selectSideMenuUser);

  const sideMenu = () => nestedMenu(sideMenuStore, location);
  // const sideMenuUser = () => nestedMenu(sideMenuUserStore, location);
  const scrollableRef = createRef<HTMLDivElement>();

  const toggleCompactMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCompactMenu(!compactMenu);
  };

  const compactLayout = () => {
    if (window.innerWidth <= 1600) {
      setCompactMenu(true);
    }
  };

  const requestFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    }
  };

  useEffect(() => {
    if (scrollableRef.current) {
      new SimpleBar(scrollableRef.current);
    }

    setFormattedMenu(sideMenu())
    compactLayout();

    window.onresize = () => {
      compactLayout();
    };
  }, [sideMenuStore, location]);

  return (
    <div
      className={clsx([
        "dagger",
        "before:content-[''] before:bg-gradient-to-b before:from-slate-100 before:to-slate-50 before:fixed before:inset-0",
      ])}
    >
      <div
        className={clsx([
          "fixed top-0 left-0 z-50 h-screen side-menu group",
          { "side-menu--collapsed": compactMenu },
          { "side-menu--on-hover": compactMenuOnHover },
        ])}
      >
        <div className="fixed top-0 inset-x-0 z-10 h-[65px] box border-x-0 border-t-0 rounded-none flex">
          <div
            className={clsx([
              "bg-white flex-none flex items-center z-10 px-5 h-full xl:w-[275px] overflow-hidden relative duration-300 group-[.side-menu--collapsed]:xl:w-[91px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:w-[275px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:shadow-[6px_0_12px_-4px_#0000001f]",
              "before:content-[''] before:hidden before:xl:block before:absolute before:right-0 before:border-r before:border-dashed before:border-slate-300/70 before:h-4/6 before:group-[.side-menu--collapsed.side-menu--on-hover]:xl:border-solid before:group-[.side-menu--collapsed.side-menu--on-hover]:xl:h-full",
            ])}
            onMouseOver={(event) => {
              event.preventDefault();
              setCompactMenuOnHover(true);
            }}
            onMouseLeave={(event) => {
              event.preventDefault();
              setCompactMenuOnHover(false);
            }}
          >
            <a
              href=""
              className="hidden xl:flex items-center transition-[margin] group-[.side-menu--collapsed]:xl:ml-2 group-[.side-menu--collapsed.side-menu--on-hover]:xl:ml-0"
            >
              <div className="flex items-center justify-center rounded-lg  ">
                <div className=" w-[40px] relative [&_div]:bg-white">
                  
                  <img src={"/unilogo.png"} className="w-[40px] h-[30px]"/>
                </div>
              </div>
              <div className="ml-3.5 group-[.side-menu--collapsed.side-menu--on-hover]:xl:opacity-100 group-[.side-menu--collapsed]:xl:opacity-0 transition-opacity font-medium">
                UNIVERSITY OF IBADAN
              </div>
            </a>
          </div>
          <div className="absolute transition-[padding] duration-100 xl:pl-[275px] group-[.side-menu--collapsed]:xl:pl-[91px] h-full inset-x-0">
            <div className="flex items-center w-full h-full px-5">
              {/* BEGIN: Search */}
              <div
                className="relative justify-center flex-1 hidden xl:flex"
                onClick={() => setQuickSearch(false)}
              >
                <div className="bg-slate-50 border w-[350px] flex items-center py-2 px-3.5 rounded-[0.5rem] text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">
                  <Lucide icon="Search" className="w-[18px] h-[18px]" />
                  <div className="ml-2.5 mr-auto">Quick search...</div>
                  <div>⌘K</div>
                </div>
              </div>
              <QuickSearch
                quickSearch={quickSearch}
                setQuickSearch={setQuickSearch}
              />

              {/* END: Search */}
            </div>
          </div>
        </div>
        <div
          className="absolute inset-y-0 xl:top-[65px] z-10 xl:z-0"
          onMouseOver={(event) => {
            event.preventDefault();
            setCompactMenuOnHover(true);
          }}
          onMouseLeave={(event) => {
            event.preventDefault();
            setCompactMenuOnHover(false);
          }}
        >
          <div
            className={clsx([
              "box xl:ml-0 border-y-0 border-l-0 rounded-none w-[275px] duration-300 transition-[width,margin] group-[.side-menu--collapsed]:xl:w-[91px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:shadow-[6px_0_12px_-4px_#0000000f] group-[.side-menu--collapsed.side-menu--on-hover]:xl:w-[275px] relative overflow-hidden h-full flex flex-col",
              "after:content-[''] after:fixed after:inset-0 after:bg-black/80 after:z-[-1] after:xl:hidden",
              { "ml-0 after:block": activeMobileMenu },
              { "-ml-[275px] after:hidden": !activeMobileMenu },
            ])}
          >
            <div
              className={clsx([
                "fixed ml-[275px] w-10 h-10 items-center justify-center xl:hidden",
                { flex: activeMobileMenu },
                { hidden: !activeMobileMenu },
              ])}
            >
              <a
                href=""
                onClick={(event) => {
                  event.preventDefault();
                  setActiveMobileMenu(false);
                }}
                className="mt-5 ml-5"
              >
                <Lucide icon="X" className="w-8 h-8 text-white" />
              </a>
            </div>
            <div
              ref={scrollableRef}
              className={clsx([
                "w-full h-full z-20 px-5 overflow-y-auto overflow-x-hidden pb-3 [-webkit-mask-image:-webkit-linear-gradient(top,rgba(0,0,0,0),black_30px)] [&:-webkit-scrollbar]:w-0 [&:-webkit-scrollbar]:bg-transparent",
                "[&_.simplebar-content]:p-0 [&_.simplebar-track.simplebar-vertical]:w-[10px] [&_.simplebar-track.simplebar-vertical]:mr-0.5 [&_.simplebar-track.simplebar-vertical_.simplebar-scrollbar]:before:bg-slate-400/30",
              ])}
            >
              <ul className="scrollable">
                {/* BEGIN: First Child */}
                {formattedMenu.map((menu, menuKey) =>
                  typeof menu == "string" ? (
                    <li className="side-menu__divider" key={menuKey}>
                      {menu}
                    </li>
                  ) : (
                    <li key={menuKey}>
                      <a
                        href=""
                        className={clsx([
                          "side-menu__link",
                          { "side-menu__link--active": menu.active },
                          {
                            "side-menu__link--active-dropdown":
                              menu.activeDropdown,
                          },
                        ])}
                        onClick={(event: React.MouseEvent) => {
                          event.preventDefault();
                          linkTo(menu, navigate);
                          setFormattedMenu([...formattedMenu]);
                        }}
                      >
                        <Lucide
                          icon={menu.icon}
                          className="side-menu__link__icon"
                        />
                        <div className="side-menu__link__title">
                          {menu.title}
                        </div>
                        {menu.badge && (
                          <div className="side-menu__link__badge">
                            {menu.badge}
                          </div>
                        )}
                        {menu.subMenu && (
                          <Lucide
                            icon="ChevronDown"
                            className="side-menu__link__chevron"
                          />
                        )}
                      </a>
                      {/* BEGIN: Second Child */}
                      {menu.subMenu && (
                        <Transition
                          in={menu.activeDropdown}
                          onEnter={enter}
                          onExit={leave}
                          timeout={300}
                        >
                          <ul
                            className={clsx([
                              "",
                              { block: menu.activeDropdown },
                              { hidden: !menu.activeDropdown },
                            ])}
                          >
                            {menu.subMenu.map((subMenu, subMenuKey) => (
                              <li key={subMenuKey}>
                                <a
                                  href=""
                                  className={clsx([
                                    "side-menu__link",
                                    {
                                      "side-menu__link--active": subMenu.active,
                                    },
                                    {
                                      "side-menu__link--active-dropdown":
                                        subMenu.activeDropdown,
                                    },
                                  ])}
                                  onClick={(event: React.MouseEvent) => {
                                    event.preventDefault();
                                    linkTo(subMenu, navigate);
                                    setFormattedMenu([...formattedMenu]);
                                  }}
                                >
                                  <Lucide
                                    icon={subMenu.icon}
                                    className="side-menu__link__icon"
                                  />
                                  <div className="side-menu__link__title">
                                    {subMenu.title}
                                  </div>
                                  {subMenu.badge && (
                                    <div className="side-menu__link__badge">
                                      {subMenu.badge}
                                    </div>
                                  )}
                                  {subMenu.subMenu && (
                                    <Lucide
                                      icon="ChevronDown"
                                      className="side-menu__link__chevron"
                                    />
                                  )}
                                </a>
                                {/* BEGIN: Third Child */}
                                {subMenu.subMenu && (
                                  <Transition
                                    in={subMenu.activeDropdown}
                                    onEnter={enter}
                                    onExit={leave}
                                    timeout={300}
                                  >
                                    <ul
                                      className={clsx([
                                        "",
                                        {
                                          block: subMenu.activeDropdown,
                                        },
                                        { hidden: !subMenu.activeDropdown },
                                      ])}
                                    >
                                      {subMenu.subMenu.map(
                                        (lastSubMenu, lastSubMenuKey) => (
                                          <li key={lastSubMenuKey}>
                                            <a
                                              href=""
                                              className={clsx([
                                                "side-menu__link",
                                                {
                                                  "side-menu__link--active":
                                                    lastSubMenu.active,
                                                },
                                                {
                                                  "side-menu__link--active-dropdown":
                                                    lastSubMenu.activeDropdown,
                                                },
                                              ])}
                                              onClick={(
                                                event: React.MouseEvent
                                              ) => {
                                                event.preventDefault();
                                                linkTo(lastSubMenu, navigate);
                                                setFormattedMenu([
                                                  ...formattedMenu,
                                                ]);
                                              }}
                                            >
                                              <Lucide
                                                icon={lastSubMenu.icon}
                                                className="side-menu__link__icon"
                                              />
                                              <div className="side-menu__link__title">
                                                {lastSubMenu.title}
                                              </div>
                                              {lastSubMenu.badge && (
                                                <div className="side-menu__link__badge">
                                                  {lastSubMenu.badge}
                                                </div>
                                              )}
                                            </a>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </Transition>
                                )}
                                {/* END: Third Child */}
                              </li>
                            ))}
                          </ul>
                        </Transition>
                      )}
                      {/* END: Second Child */}
                    </li>
                  )
                )}
                {/* END: First Child */}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div
        className={clsx([
          "transition-[margin,width] duration-100 px-5 mt-[65px] pt-[31px] pb-16 relative z-10",
          { "xl:ml-[275px]": !compactMenu },
          { "xl:ml-[91px]": compactMenu },
        ])}
      >
        <div className="container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;
