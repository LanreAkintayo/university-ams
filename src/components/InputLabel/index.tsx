import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { ImNotification } from "react-icons/im";
import { ReactNode } from "react"; // Import ReactNode

interface InputLabelProps {
  title: string;
  subTitle?: string;
  important?: boolean;
  note?: ReactNode;
  className?: ReactNode;// Change Note to ReactNode
}

function Main({ title, subTitle, important, note, className }: InputLabelProps) {
  return (
    <div className={`${className} relative mb-2 flex items-center text-base`}>
      <span className="">
        {title}
        {important && (
          <sup className="text-red-500 ltr:ml-1.5 rtl:mr-1.5">*</sup>
        )}
      </span>
      {subTitle && (
        <span className="block text-xs tracking-tighter sm:text-sm">
          {subTitle}
        </span>
      )}

      {note && (
        <Popup
          trigger={(open) => (
            <button className="mx-2 text-gray-500">
              <ImNotification />
            </button>
          )}
          position="bottom center"
          closeOnDocumentClick
          className="bg-gray-800"
          contentStyle={{
            padding: "10px",
            border: "1px solid #fff ",
            background: "#fff",
            width: "450px",
          }}
          arrowStyle={{
            color: "#29293d",
          }}
          arrow={false}
        >
          {note} {/* Render the note here */}
        </Popup>
      )}
    </div>
  );
}

export default Main;
