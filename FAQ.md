# Frieren — Frequently Asked Questions (Beginner Guide)

This is a plain-language guide for getting Frieren running, even if you have never
touched OpenWrt before. If you can copy and paste a command, you can do this.

---

## What is Frieren, in one sentence?

Frieren is a **web control panel for security gadgets**. You install it on an OpenWrt
router (or a small single-board computer), open a web page, and from there you manage
WiFi, run tools, install modules, and use a built-in terminal — all from your browser,
no command line required after setup.

---

## What do I need before I start?

1. **A device that runs OpenWrt.** A cheap travel router works great. A popular one is
   the **GL-AR300M16-EXT**, but almost any OpenWrt-capable device will do.
2. **OpenWrt 20 or newer** installed on it. Frieren is developed and tested on
   **OpenWrt 24.x**, so if you can, use the latest 24.x release.
   > Important: use **official OpenWrt builds**, not the manufacturer's own "forked"
   > firmware (for example, the stock GL.iNet firmware). Install real OpenWrt first.
3. **Internet on the device.** The installer downloads Frieren from GitHub, so the
   router needs to be online during setup.
4. **A computer on the same network** to open the panel afterwards.

---

## Step 1 — Put clean OpenWrt on your device

If your device already runs official OpenWrt, skip to Step 2.

1. Find the right firmware for your exact model. The easy trick: search Google for your
   model name followed by `site:openwrt.org`. Example for the GL-AR300M16:

   ```
   gl-ar300m site:openwrt.org
   ```

   That takes you to the official device page.

2. On that page, look for the **"Firmware OpenWrt Install URL"**. It points to the
   correct image file, for example:

   ```
   https://downloads.openwrt.org/releases/24.10.0/targets/ath79/generic/openwrt-24.10.0-ath79-generic-glinet_gl-ar300m16-squashfs-sysupgrade.bin
   ```

   You can browse newer versions from the top level:
   [https://downloads.openwrt.org/releases/](https://downloads.openwrt.org/releases/)

3. Flash that image to your device (via the device's web recovery / U-Boot, following
   the model's OpenWrt page). When it reboots, you have clean OpenWrt.

> Not sure how to flash? Every device's OpenWrt page has step-by-step flashing
> instructions specific to that hardware. Follow those — they are the source of truth.

---

## Step 2 — Connect and open a terminal on the router

1. Plug your computer into the router (LAN port or its WiFi). By default OpenWrt uses
   the address **`192.168.1.1`**.
2. Open a terminal on your computer and connect over SSH:

   ```sh
   ssh root@192.168.1.1
   ```

   The first time, set a root password if OpenWrt asks (in LuCI, the web UI at
   `http://192.168.1.1`, go to **System → Administration** and set a password).
   **Remember this password — it is also your Frieren login.**

---

## Step 3 — Install Frieren (one command)

With OpenWrt online and you connected over SSH, paste this single command:

```sh
wget -qO- https://raw.githubusercontent.com/xchwarze/frieren-release/master/install/install-openwrt.sh | sh
```

That's it. The script updates the package list, downloads Frieren, installs it, and
starts the services. When it finishes, it prints the exact address to open, like:

```
To access the Frieren web interface, open a web browser and navigate to: http://192.168.1.1:5000/
```

> If it complains about **file clashes**, re-run the same command with `-f` to force it:
> ```sh
> wget -qO- https://raw.githubusercontent.com/xchwarze/frieren-release/master/install/install-openwrt.sh | sh -s -- -f
> ```

---

## Step 4 — Open the panel and log in

1. In your browser, go to your router's IP on **port 5000**:

   ```
   http://192.168.1.1:5000/
   ```

   (Use whatever IP the installer printed.)

2. **Login:** Frieren uses your **OpenWrt system account**. There is no separate
   Frieren password.
   - **Username:** `root`
   - **Password:** the router's root password (the same one you use for SSH and LuCI)

Done — you are in the panel.

---

## What can I do inside the panel?

- **WiFi Management** — create, edit, and remove wireless networks; scan for nearby
  networks; tweak radios; edit raw config if you like.
- **Network** — manage interfaces, see who's connected (DHCP leases), run connectivity
  checks.
- **Modules** — install extra features from the online module catalog with one click,
  and remove or pin them.
- **Package Manager** — install/remove OpenWrt (`opkg`) packages from the browser.
- **Terminal** — a full web terminal (ttyd), so you rarely need a separate SSH window.
  The terminal itself runs on **port 5001**; the panel opens it for you.
- **System Tools** — dashboard with stats, USB devices, disk usage, system log viewer,
  diagnostics, and start/stop of services.
- **Settings** — change hostname, timezone, **your password**, and the panel theme
  (including dark mode).

The dashboard also shows a small **News** feed pulled from the project, so you'll see
important announcements without leaving the panel. Changes apply live — you do **not**
need to reboot the router after installing Frieren or a module.

---

## How do I install a module?

1. Open the **Modules** section in the panel.
2. Browse the available modules and click **Install** on the one you want.
3. It downloads and loads automatically — no reboot needed.

Modules come from the official catalog. Some need a minimum panel version; if a module
needs a newer Frieren than you have, the panel tells you instead of installing something
broken. In that case, update Frieren first (see below).

> **Running out of space?** Cheap routers have tiny internal storage. If you plug in a
> **USB drive**, Frieren can install and store modules there instead of internal flash.
> When a USB drive is detected, the Modules screen lets you choose it as the install
> location — great for keeping several modules on a small device.

---

## How do I update Frieren?

Just run the install command again. It removes the old version and installs the newest
one automatically:

```sh
wget -qO- https://raw.githubusercontent.com/xchwarze/frieren-release/master/install/install-openwrt.sh | sh
```

---

## How do I uninstall Frieren?

From an SSH session on the router:

```sh
opkg remove frieren
```

---

## Troubleshooting

**The panel won't open at `:5000`.**
- Make sure you're on the same network as the router and using the **right IP** (the one
  the installer printed). If your router isn't `192.168.1.1`, use its real address.
- Give it a few seconds after install — the services need to start.

**"OpenWrt version not supported" during install.**
- You need **OpenWrt 20 or newer** (24.x recommended). Older versions and manufacturer
  forks are not supported. Flash official OpenWrt (Step 1) and try again.

**Install failed with a file-clash error.**
- Re-run the installer with the force flag (see the tip in Step 3).

**I can't log in.**
- The login is your **OpenWrt root password**, not a Frieren-specific one. If you never
  set a root password, set it in LuCI (`http://192.168.1.1` → System → Administration)
  or with `passwd` over SSH, then log in with `root` + that password.

**No internet on the router during install.**
- The installer downloads from GitHub. Connect the router's WAN to the internet first,
  then run the command.

**The web terminal won't open.**
- The terminal uses **port 5001**. Make sure nothing blocks it on your network, and that
  you reached the panel on port 5000 first (the panel starts the terminal for you).

---

## Quick reference

| Thing | Value |
|-------|-------|
| Supported OS | OpenWrt 20+ (tested on 24.x, official builds only) |
| Install command | `wget -qO- https://raw.githubusercontent.com/xchwarze/frieren-release/master/install/install-openwrt.sh \| sh` |
| Panel URL | `http://<router-ip>:5000/` (often `http://192.168.1.1:5000/`) |
| Terminal port | `5001` (opened from the panel) |
| Login user | `root` |
| Login password | your OpenWrt root password |
| Install location | `/usr/share/frieren` |
| Update | re-run the install command |
| Uninstall | `opkg remove frieren` |

---

## Need more help?

- Main project: [github.com/xchwarze/frieren](https://github.com/xchwarze/frieren)
- Releases & installers: [github.com/xchwarze/frieren-release](https://github.com/xchwarze/frieren-release)
- Modules: [github.com/xchwarze/frieren-modules](https://github.com/xchwarze/frieren-modules)
- Contact: **DSR!** — xchwarze@gmail.com
