<script>
    import { onMount } from "svelte";
    import levelsData from "./data/levels.json";
    import ModNode from "./components/SettingsModNode.svelte";
    import {
        ReadFile,
        ReadJSON,
        WriteFile,
        WriteToJSON,
    } from "./library/configfiles";
    import { objectbuffer } from "./library/datatransfer.js";
    import { invoke } from "@tauri-apps/api/tauri";
    import { open } from "@tauri-apps/api/dialog";
    import ModInstall from "./components/ModInstall.svelte";
    let data;

    let levelLoaderButtons;
    let mainSettings;
    let levelLoader;
    let unsavedCmdline;

    let search = "";

    let selectedLevel = "";

    objectbuffer.subscribe((value) => {
        data = value;
    });

    function OpenLevelLoader() {
        mainSettings.style.display = "none";
        levelLoader.style.display = "block";
        selectedLevel = cmdline.substring(0, levelEndIndex);
    }

    function OpenDirectory() {
        let p = data.path.replace("/", "\\");

        invoke("playgame", { dolphin: "explorer", exe: p });
    }

    function CreateModNode(element, index) {
        let modNode = new ModNode({
            target: modNodeGrid,
        });

        modNode.index = index;
        modNode.gamedata = data;
        modNode.modName = element.name;
        modNode.json = JSON.stringify(element);
        modNode.dumploc = data.path;
        modNode.active = element.active;
        modNode.setChecked(element.active);
    }

    let buttons = [];

    let cmdline = "";

    let input = "";

    let modNodeGrid;

    let levelEndIndex;

    onMount(async () => {
        levelsData.forEach((level) => {
            let btn = document.createElement("button");
            btn.innerHTML = level.name;
            btn.style.marginLeft = "3px";
            btn.style.marginTop = "3px";
            btn.onclick = function () {
                SetLevel(level);
            };
            levelLoaderButtons.appendChild(btn);
            buttons.push({ button: btn, level: level });
        });

        let ModsData = await ReadFile(data.path + "/EMLMods.json");

        let ModsDataObject = JSON.parse(ModsData);

        ModsDataObject.forEach((element) => {
            let i = ModsDataObject.indexOf(element);
            CreateModNode(element, i);
        });

        cmdline = await ReadFile(data.path + "/files/cmdline.txt");

        unsavedCmdline = cmdline;

        for (let index = 0; index < cmdline.length; index++) {
            if (cmdline.at(index) === "-") {
                levelEndIndex = index - 1;
                break;
            }
        }
        selectedLevel = cmdline.substring(0, levelEndIndex);
    });

    async function InstallLocalMod() {
        const selectedPath = await open({
            title: "Select ZIP",
            multiple: false,
        });

        console.log(selectedPath);

        let filename = selectedPath
            .toString()
            .split("\\")
            .pop()
            .split("/")
            .pop();

        let gameid;
        if (data.game == "EM1") {
            gameid = "SEME4Q";
        } else {
            gameid = "SERE4Q";
        }

        let modInstallElement = new ModInstall({
            target: document.body,
        });
        modInstallElement.modIcon = "img/waren.png";
        modInstallElement.modName = filename;
        modInstallElement.action = "Installing";
        modInstallElement.description =
            "This might take a while depending on your storage device's speed.";

        invoke("download_mod", {
            url: selectedPath,
            name: filename,
            dumploc: data.path,
            gameid: gameid,
        }).then(async (json) => {
            let changedFiles = JSON.parse(json);
            let currentMods = JSON.parse(
                await ReadFile(data.path + "/EMLMods.json")
            );
            currentMods.push(changedFiles);
            await WriteFile(
                JSON.stringify(currentMods),
                data.path + "/EMLMods.json"
            );
            modInstallElement.$destroy();
            CreateModNode(changedFiles, currentMods.length);
        });
    }

    function SetLevel(lvl) {
        unsavedCmdline = cmdline.substring(levelEndIndex, cmdline.length);

        let newCmdLine = lvl.path + unsavedCmdline;

        unsavedCmdline = newCmdLine;

        levelEndIndex = lvl.path.length;

        selectedLevel = lvl.path + "*";
    }

    async function DeleteFromGameList() {
        let dat = await ReadJSON("games.json");

        let toDelete = await dat.find((r) => r.path === data.path);

        dat.splice(dat.indexOf(toDelete));

        await WriteToJSON(JSON.stringify(dat), "games.json");

        window.open("#/", "_self");
    }

    async function ExitLevelLoader(type) {
        cmdline = unsavedCmdline;

        await WriteFile(cmdline, data.path + "/files/cmdline.txt");

        if (type == 1) {
            mainSettings.style.display = "block";
            levelLoader.style.display = "none";
        } else {
            await window.open("#/", "_self");
        }
    }

    function Search(e) {
        if (input != "") {
            buttons.forEach((b) => {
                b.button.style.display = "none";
            });
            let allValid = buttons.filter((r) =>
                r.level.name.toLowerCase().includes(input.toLowerCase())
            );

            allValid.forEach((b) => {
                b.button.style.display = "inline-block";
            });
        } else {
            buttons.forEach((b) => {
                b.button.style.display = "inline-block";
            });
        }
    }

    function GoBackToGames() {
        window.open("#/", "_self");
    }
</script>

<main>
    <div bind:this={mainSettings}>
        <plaintext>Epic Mickey Settings</plaintext>
        <hr />
        <p />
        <button on:click={OpenLevelLoader}>Change Level</button>
        <button on:click={OpenDirectory}>Open Directory</button>
        <button on:click={DeleteFromGameList}>Delete from Game List</button>
        <button on:click={GoBackToGames}>Back</button>

        <h1>Mods</h1>
        <hr />
        <p />
        <div bind:this={modNodeGrid} />

        <button on:click={InstallLocalMod}>Install Local Mod</button>
    </div>

    <div bind:this={levelLoader} style="display:none;">
        <h1>Level Loader</h1>
        <hr />
        <p />

        <input
            style="margin-left: 12px;"
            bind:value={input}
            on:input={Search}
            placeholder="Search..."
        />

        <div
            bind:this={levelLoaderButtons}
            style="background-color:#242424;padding:10px"
        />

        <p>Selected Level: {selectedLevel}</p>

        <hr />

        <p>
            <button on:click={() => ExitLevelLoader(1)}
                >Set Level and return to Settings</button
            >
            <button on:click={() => ExitLevelLoader(2)}
                >Set Level and Return to Game List</button
            >
            <plaintext><s>stolen</s> borrowed from RampantLeaf</plaintext>
        </p>
    </div>
</main>
