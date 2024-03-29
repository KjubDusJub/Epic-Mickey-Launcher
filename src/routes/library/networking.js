export const serverLink = 'https://api.kalsvik.no/';
export const staticAssetsLink = 'https://api.kalsvik.no/';
export let loggedin = false;
import {
  WriteToken,
  ReadToken
} from "./configfiles.js";
import {
  Subscribe,
  Invoke
} from "./callback.js";

let accountinfo;

export async function SignIn(userinfo) {
  await Login(userinfo)
}

export async function SetLoggedIn(l) {
  loggedin = l
}

export async function Register(userinfo) {
  let info = await POST("register", {
    username: userinfo.username,
    password: userinfo.password
  })

  if (info.error == 1) {
    //account with same username already exists
    return
  }

  Login({
    token: info.token
  })
}

function isNullOrWhitespace( input ) {
  console.log(input)
  return input == input.trim();
}

export function UploadMod(modfile, cb, r, e, checked) {
   GetUserInfo().then((info) => {
    MultipartPOST("modupload", {
      token: info.token,
      modfile: modfile,
      extension: e,
      replacing: r,
      automaticPublish: checked
    }).then((moduploadresult) => {
      console.log("itty bitty fart")
  
      moduploadresult.json().then((res) => {
        Invoke("onModUpload", res.id)
      });
    })
  
  
  })

}

export async function GetToken() {

  if(accountinfo == null){
    return ""
  }

  return accountinfo.token;
}
export async function GetId() {
  if(accountinfo == null){
    return ""
  }

  return accountinfo.id;
}

export async function OnSignedIn(cb) {

  if (loggedin) {
    cb(await GetUserInfo())
  } else {
    Subscribe("SignedIn", cb, true)
  }
}

export async function Login(userinfo) {
  loggedin = false;
  let finalinfo;

  if(userinfo.token === "")
  {
    if(isNullOrWhitespace(userinfo.username) || isNullOrWhitespace(userinfo.password)) {
      await alert("You forgot to enter your username or password, doofus.")
      return
    }
  }

  if (userinfo.token != null) {
    finalinfo = await POST("signintoken", {
      token: userinfo.token
    })
  } else {
    finalinfo = await POST("signin", {
      username: userinfo.username,
      password: userinfo.password
    })
  }

  if (finalinfo != null) {
    accountinfo = finalinfo
    await WriteToken(finalinfo.token)
    loggedin = true;
    Invoke("SignedIn", finalinfo)
  } else {
    loggedin = false
    Invoke("SignedIn", {
      error: 1
    })
  }

}

export async function GetUserInfo() {
  if (accountinfo == null) {
    return {
      error: 0
    }
  } else {
    return accountinfo
  }
}

export async function MultipartPOST(route, data) {
  
  const formData = new FormData();
  for (const name in data) {
    formData.append(name, data[name])
  }
  const res = await fetch(serverLink + route, {
    method: 'POST',

    body: formData
  });
  return await res;
}

export async function POST(route, data) {

  const res = await fetch(serverLink + route, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },

    body: JSON.stringify(data)
  });
  const content = await res.json();
  return content;
}
export async function GET(route) {
  const res = await fetch(serverLink + route)
  const content = await res.json();
  return content;
}

export async function GETEXT(route) {
  const res = await fetch(route)
  const content = await res.json();
  return content;
}