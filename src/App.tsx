import React, { useState, useRef } from "react";
import { useAppVisible } from "./utils";
// import {
//   IBatchBlock,
// } from "@logseq/libs/dist/LSPlugin.user";
function App() {
  // const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  if (visible) {
    // const [formValues, setFormValues] = useState("");
    var isOn = false;
    var searchAvailable = false;
    var formValues = "";
    var replaceValues = "";
    var freezeEntry = true;
    var results = [];
    function changeValue(e: any) {
      formValues = e.target.value;
      console.log("hi");
      console.log(formValues);

      if (formValues != "") {
        searchAvailable = false;
      }
      checkEnableability();
    }
    function changeReplaceValue(e: any) {
      replaceValues = e.target.value;
      checkEnableability();
    }
    function checkEnableability() {
      var replaceEntry = document.getElementById("Replace Status")!;
      if (
        searchAvailable == true &&
        replaceValues != "" &&
        results.length != 0
      ) {
        replaceEntry.className = replaceEntry.className.replace(
          "opacity-20",
          "opacity-100"
        );
        freezeEntry = false;
      } else {
        replaceEntry.className = replaceEntry.className.replace(
          "opacity-100",
          "opacity-20"
        );
        freezeEntry = true;
      }
    }
    function searchClicked() {
      logseq.DB.datascriptQuery(
        `
      [:find (pull ?b [*])
         :where
         [?b :block/content ?c]
         [(re-pattern "(?i)${formValues}") ?p]
         [(re-find ?p ?c)]
       ]
      `
      ).then((result) => {
        document.getElementById(
          "matchCount"
        )!.innerHTML = `Matches: ${result.length}`;
        searchAvailable = true;
        checkEnableability();
        results = result;
      });
    }
    function replaceClicked() {
      var retVal = confirm(
        `Are you sure you want to replace all instances of "${formValues}" with "${replaceValues}" across ${results.length} blocks?`
      );
      if (retVal == true) {
        for (const x in results) {
          console.log(results[x]);
          const uuid = results[x][0].uuid["$uuid$"];
          console.log(uuid);
          const content = results[x][0].content;
          console.log(content);
          logseq.Editor.updateBlock(
            results[x][0].uuid["$uuid$"],
            results[x][0].content.replaceAll(formValues, replaceValues)
          );
          logseq.hideMainUI();
        }

        logseq.App.showMsg(
          `Successfully replaced in ${results.length} blocks", "success`
        );
      } else {
        logseq.hideMainUI();
        logseq.App.showMsg("Replacement Operation Cancelled", "error");
      }
    }
    return (
      <div className="grid place-items-center justify-center h-screen">
        <div className="bg-gray-400 items-center rounded-md p-4 max-w-6/10">
          <div className="grid grid-cols-2 gap-4 place-items-auto">
            {/* <div className="grid place-items-center"> */}
            <div>
              <h1 className="font-bold text-size-20px p-3">Find</h1>
            </div>
            <input onChange={changeValue} className="rounded-md"></input>
            <label className="px-4" id="matchCount">
              Matches: 0
            </label>
            <button
              onClick={searchClicked}
              className=" bg-dark-200 p-2 px-4 rounded-md text-light-300"
            >
              Search!
            </button>
            {/* </div> */}
            {/* <div className="grid place-items-center"> */}
            <h1 className="font-bold text-size-20px p-3">Replace</h1>
            <input onChange={changeReplaceValue} className="rounded-md"></input>

            <label className="px-4">
              Warning: This operation is irreversible. Make sure you have a
              backup of your data
            </label>
            <button
              id="Replace Status"
              onClick={replaceClicked}
              className="bg-dark-200 p-2 px-4 rounded-md text-light-300 opacity-20"
            >
              Replace All!
            </button>
          </div>
        </div>
        <br></br>
      </div>
    );
  }
  return null;
}

export default App;
