import { useEffect, useRef, useState } from "react";
import {
  PreviewComponent,
  Preview,
  Source,
  Highlight,
} from "../../base-components/PreviewComponent";
import { FormSwitch } from "../../base-components/Form";
import Dropzone, { DropzoneElement } from "../../base-components/Dropzone";

const LoadingBar = ({ progress, color }: { progress: any;  color:any}) => {
  const progressBarColor = color || "teal"; // Default color is teal if not provided

  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span
            className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-${progressBarColor}-600 bg-${progressBarColor}-200`}
          >
            Loading
          </span>
        </div>
        <div className="text-right">
          <span
            className={`text-xs font-semibold inline-block text-${progressBarColor}-600`}
          >{`${progress}%`}</span>
        </div>
      </div>
      <div className={`flex rounded-full bg-${progressBarColor}-200`}>
        <div
          style={{ width: `${progress}%` }}
          className={`rounded-full bg-blue-400`}
        ></div>
      </div>
    </div>
  );
};

function App() {
  const [selectedFile, setSelectedFile]: any = useState();
  const [cid, setCid]: any = useState();
  const changeHandler = (event: any) => {

    console.log("event.target.files[0]: ", event.target.files[0])
    
    setSelectedFile(event.target.files[0]);
  };

  const [progress, setProgress] = useState(0);

  const dropzoneMultipleRef = useRef<DropzoneElement>();

  const handleSubmission = async () => {
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const metadata = JSON.stringify({
        name: "File name",
      });
      formData.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      setCid(resData.IpfsHash);
      console.log(resData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress < 100) {
        setProgress(progress + 1);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <>
      <label className="form-label"> Choose File</label>
      <input type="file" onChange={changeHandler} />
      <button onClick={handleSubmission}>Submit</button>
      {cid && (
        <img
          src={`${import.meta.env.VITE_PINATA_GATEWAY_URL}/ipfs/${cid}`}
          alt="ipfs image"
        />
      )}
      <PreviewComponent>
        {({ toggle }) => (
          <>
            <div className="flex flex-col sm:items-center pb-5 mb-5 border-b border-dashed sm:flex-row border-slate-300/70">
              <div className="text-[0.94rem] font-medium">
                Multiple File Upload
              </div>
            </div>
            <div>
              <div className="border rounded-[0.6rem] dark:border-darkmode-400 relative mt-7 mb-4 border-slate-200/80">
                <div className="px-5 py-2 mt-4 flex flex-col gap-3.5">
                  <Preview>
                    <Dropzone
                      getRef={(el) => {
                        dropzoneMultipleRef.current = el;
                      }}
                      options={{
                        url: "https://httpbin.org/post",
                        thumbnailWidth: 150,
                        maxFilesize: 0.5,
                        headers: {
                          "My-Awesome-Header": "header value",
                        },
                      }}
                      className="dropzone"
                    >
                      <div className="text-lg font-medium">
                        Drop files here or click to upload.
                      </div>
                      <div className="text-gray-600">
                        This is just a demo dropzone. Selected files are
                        <span className="font-medium">not</span> actually
                        uploaded.
                      </div>
                    </Dropzone>
                  </Preview>
                </div>
              </div>
            </div>
            <LoadingBar progress={progress} color="blue" />
          </>
        )}
      </PreviewComponent>
    </>
  );
}

export default App;
