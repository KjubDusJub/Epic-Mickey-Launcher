<svelte:options accessors={true} />

<script>
    import { SetData, objectbuffer } from "../library/datatransfer.js";
    import { invoke } from "@tauri-apps/api/tauri";
    import { ReadJSON } from "../library/configfiles.js";
    import { onMount } from "svelte";
    export let game = "";
    export let filepath = "";
    export let platform = "";
    export let region = "";
    export let imgBackgroundURL = undefined;
    export let imgLogoURL = undefined;
    export let errorMSG = "";
    export let data;

    let reg = "";

    let platformlogo;

    async function OpenGame() {
        let d = await ReadJSON("conf.json");
        if (platform == "wii") {
            invoke("playgame", {
                dolphin: d.dolphinPath,
                exe: filepath + "/sys/main.dol",
                id: data.id
            }).then((res) => {
                if (res == 1) {
                    alert(
                        "Game failed to open. Make sure that you have specified Dolphin's executable path in the settings.",
                    );
                }
            });
        } else {
            invoke("playgame", {
                dolphin: filepath + "/Launch.exe",
                exe: "",
                id: ""
            }).then((res) => {
                if (res == 1) {
                    alert("Game failed to open.");
                }
            });
        }
    }

    export function Init() {
        switch (platform) {
            case "wii":
                platformlogo.src = "img/Wii.svg";
                break;
            case "pc":
                platformlogo.src = "img/windows.svg";
                break;
        }

        //muterrs
        let result = { game: "", result: "" };

        reg = data.region;
        switch (data.region) {
            case "NTSC-U":
                result.game = "EM1";
                result.region = "NTSC-U";

                regionPath = "img/regions/usa.svg";

                break;

            case "PAL.DE,ES,IT":
                regionPath = "img/regions/deites.svg";
                break;

            case "PAL,EN,SE,DK":
                regionPath = "img/regions/scandi2.svg";
                break;

            case "PAL.SE,DK,NO":
                regionPath = "img/regions/scandi1.svg";
                break;

            case "PAL.EN,FR,NL":
                regionPath = "img/regions/frnl.svg";
                break;

            case "NTSC-J":
                regionPath = "img/regions/jp.svg";
                break;

            //EM2

            case "PAL.FR,DE,IT":
                //todo: change this with actual correct region image
                regionPath = "img/regions/deites.svg";
                break;

            case "NTSC-K":
                regionPath = "img/regions/korea.svg";
                break;

            case "PAL.EN,FR,ES,NL,PT,TR":
                //every single country here except for turkey is in the eu so i'll just call this the EU version

                region = "img/regions/eu.svg";
                break;
        }
    }

    let regionPath = "";
    onMount(async () => {});

    function OpenLevelLoader() {
        SetData("levelloaderdata", data);
        window.open("#/levelloader", "_self");
    }
</script>

<main>
    <div class="gamenode" style="background-image: url('{imgBackgroundURL}')">
        <div style="float:right;margin-left:15px;">
            <img class="gamelogo" src={imgLogoURL} alt="" />
        </div>

        <div style="margin-left:auto;margin-top:10px;">
            <button on:click={OpenGame} class="gameplaybutton">Play</button>
            <button on:click={OpenLevelLoader} class="gamesettings">...</button>
            <br />
            <img
                style="width:15px;height:15px;float:right;padding-top:5px;padding-right:3px;"
                alt="platform"
                bind:this={platformlogo}
                src="img/Wii.svg"
            />
            <img
                title={reg}
                style="height:15px;margin-left:50px;display:inline;padding-right:5px;padding-top:5px;"
                src={regionPath}
            />
        </div>

        <plaintext class="error">{errorMSG}</plaintext>
    </div>
</main>

<style>
    .nameofbuild {
        pointer-events: none;
        opacity: 0;
        transition-duration: 0.3s;
        bottom: 125px;
        left: 20px;
    }

    .gamenode {
        box-shadow: 2px 2px 10px rgb(0, 0, 0);
        border-radius: 10px;
        margin-right: auto;
        margin-left: auto;
        width: 500px;
        height: 80px;
        align-items: center;
        display: flex;
    }

    .error {
        position: relative;
        left: 520px;
        bottom: 135px;
    }

    .gameplaybutton {
        padding: 10px 20px;
        background: rgb(2, 0, 36);
        background: linear-gradient(
            143deg,
            rgba(2, 0, 36, 1) 0%,
            rgba(0, 0, 0, 1) 0%,
            rgba(229, 0, 255, 1) 0%,
            rgba(133, 0, 196, 1) 100%
        );
        border: none;
        border-radius: 10px 0px 0px 10px;
        transition-duration: 0.2s;
    }

    .gameplaybutton:hover {
        background: linear-gradient(
            0deg,
            rgba(2, 0, 36, 1) 0%,
            rgba(0, 0, 0, 1) 0%,
            rgba(229, 0, 255, 1) 0%,
            rgba(133, 0, 196, 1) 100%
        );
    }

    .gamesettings:hover {
        background: linear-gradient(
            0deg,
            rgba(2, 0, 36, 1) 0%,
            rgba(0, 0, 0, 1) 0%,
            rgba(229, 0, 255, 1) 0%,
            rgba(133, 0, 196, 1) 100%
        );
    }
    .gamesettings {
        padding: 10px 5px;
        background: rgb(2, 0, 36);
        background: linear-gradient(
            143deg,
            rgba(2, 0, 36, 1) 0%,
            rgba(0, 0, 0, 1) 0%,
            rgba(229, 0, 255, 1) 0%,
            rgba(133, 0, 196, 1) 100%
        );
        border: none;
        border-radius: 0px 10px 10px 0px;
    }
    .gamelogo {
        width: 200px;
        height: 50px;
        left: 20px;
        bottom: 70px;
        filter: drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.877));
        transition-duration: 0.3s;
    }

    .gamelogo:hover {
        transform: scale(1.1);
    }
</style>