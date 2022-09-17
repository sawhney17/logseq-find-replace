import React, { useState, useEffect } from "react";
import { useAppVisible } from "./utils";
function App() {
  const visible = useAppVisible();
  const [scopePage, setScopePage] = useState(true);
  const [formValues, setFormValues] = useState("");
  const [replaceValues, setReplaceValues] = useState("");
  const [caseInSensitivity, setCaseInSensitivity] = useState(true);
  const [freezeEntry, setFreezeEntry] = useState(true);
  const [searchAvailable, setSearchAvailable] = useState(false);
  const [results, setQueryResults] = useState([]);

  function checkEnableability() {
    var replaceEntry = document.getElementById("Replace Status")!;
    if (searchAvailable == true && results.length != 0) {
      replaceEntry.className = replaceEntry.className.replace(
        "opacity-20",
        "opacity-100"
      );
      setFreezeEntry(false);
    } else {
      replaceEntry.className = replaceEntry.className.replace(
        "opacity-100",
        "opacity-20"
      );
      setFreezeEntry(true);
    }
  }
  function databaseScope() {
    if (!scopePage) {
      return "current page";
    } else {
      return "entire database";
    }
  }

  React.useEffect(() => {
    if (visible) {
      checkEnableability();
      document.getElementById("titleLabel")!.innerHTML =
        "Searching in " + databaseScope();
    }
  });
  if (visible) {
    // var setSearchAvailable(false);
    // var setFreezeEntry(true);

    function changeValue(e: any) {
      setFormValues(e.target.value);
      document.getElementById("matchCount")!.innerHTML = `Matches: ?`;
      if (formValues != "") {
        setSearchAvailable(false);
      }
      checkEnableability();
    }
    function changeReplaceValue(e: any) {
      setReplaceValues(e.target.value);
      //wait 100 ms and then check enableability
      checkEnableability();
    }
    function scopeToggle() {
      setSearchAvailable(false);
      checkEnableability();
      document.getElementById("matchCount")!.innerHTML = `Matches: ?`;
      document.getElementById("titleLabel")!.innerHTML =
        "Searching in " + databaseScope();
      setScopePage(!scopePage);
    }
    function caseToggle() {
      setSearchAvailable(false);
      document.getElementById("matchCount")!.innerHTML = `Matches: ?`;

      checkEnableability();
      setCaseInSensitivity(!caseInSensitivity);
    }
    async function searchClicked() {
      if (scopePage) {
        if (caseInSensitivity) {
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
            performMatches(result);
          });
        } else {
          logseq.DB.datascriptQuery(
            `
            [:find (pull ?b [*])
            :where
            [?b :block/content ?c]
            [(re-pattern "hello") ?p]
            [(re-find ?p ?c)]
          ]
      `
          ).then((result) => {
            performMatches(result);
          });
        }
      } else {
        let block = (await logseq.Editor.getCurrentPage()).name;
        console.log(block);
        let pageName = block;
        console.log(`[:find (pull ?b [*])
        :where
        [?b :block/page [:block/name "${pageName}"]]
        [?b :block/content ?c]
        [(re-pattern "(?i)${formValues}") ?p]
  [(re-find ?p ?c)]
]`);
        if (caseInSensitivity) {
          logseq.DB.datascriptQuery(
            `[:find (pull ?b [*])
               :where
               [?b :block/page [:block/name "${pageName}"]]
               [?b :block/content ?c]
               [(re-pattern "(?i)${formValues}") ?p]
         [(re-find ?p ?c)]
 ]`
          ).then((result) => {
            performMatches(result);
          });
        } else {
          logseq.DB.datascriptQuery(
            `
            [:find (pull ?b [*])
               :where
               [?b :block/page [:block/name "${pageName}"]]
               [?b :block/content ?c]
               [(re-pattern "${formValues}") ?p]
         [(re-find ?p ?c)]
 ]
      `
          ).then((result) => {
            performMatches(result);
          });
        }
      }
      function performMatches(result) {
        document.getElementById(
          "matchCount"
        )!.innerHTML = `Matches: ${result.length}`;
        setSearchAvailable(true);
        checkEnableability();
        setQueryResults(result);
      }
    }
    function replaceClicked() {
      if (freezeEntry == false) {
        var retVal = confirm(
          `Are you sure you want to replace all instances of "${formValues}" with "${replaceValues}" across ${results.length} blocks?`
        );
        if (retVal == true) {
          for (const x in results) {
            console.log(results[x]);
            const uuid = results[x][0].uuid;
            console.log(uuid);
            const content = results[x][0].content;
            console.log(content);
            var regex;
            if (caseInSensitivity) {
              regex = new RegExp(formValues, "ig");
            } else {
              regex = new RegExp(formValues, "g");
            }
            console.log(regex);
            console.log(content.replaceAll(regex, replaceValues));
            logseq.Editor.updateBlock(
              results[x][0].uuid,
              results[x][0].content.replaceAll(regex, replaceValues)
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
    }
    return (
      <div className="grid place-items-center justify-center h-screen">
        <div className="bg-gray-400 items-center rounded-md p-4 max-w-6/10">
          <label className="text-3xl font-bold" id="titleLabel">
            Searching in current page
          </label>
          <br></br>
          <br></br>
          <div className="grid grid-cols-2 gap-4 place-items-auto">
            {/* <div className="grid place-items-center"> */}
            <div>
              <h1 className="font-bold text-size-23px p-3">Find</h1>
            </div>
            <input onChange={changeValue} className="rounded-md"></input>
            <label className="px-4" id="matchCount">
              Matches: ?
            </label>
            <button
              onClick={searchClicked}
              className=" bg-dark-200 p-2 px-4 rounded-md text-light-300"
            >
              Search!
            </button>
            {/* </div> */}
            {/* <div className="grid place-items-center"> */}
            <h1 className="font-bold text-size-23px p-3">Replace</h1>
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
            <div>
              <input
                type="checkbox"
                checked={scopePage}
                onChange={scopeToggle}
              ></input>{" "}
              Search ENTIRE database
            </div>
            <div>
              <input
                type="checkbox"
                checked={caseInSensitivity}
                onChange={caseToggle}
              ></input>{" "}
              Ignore Case(Case insensitive)?
            </div>
          </div>
        </div>
        <br></br>
      </div>
    );
  }
  return null;
}

export default App;
