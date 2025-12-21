# Deployment Guide: From Your Code to a Live Website

Hello! This guide will walk you through deploying your project to an Ubuntu server (like a VM in a datacenter). We'll set it up so you can access it from your local computer, and we'll prepare it for any future projects you might want to add.

I've written this guide for beginners, so I'll explain each step.

## What We're Going to Do

We're going to set up a professional-grade environment for your web application. Here's the big picture:

1.  **Prepare Your Server:** We'll install the necessary software on your Ubuntu VM:
    - **Node.js:** To run your backend application.
    - **Nginx:** A high-performance web server that will act as a "reverse proxy."
    - **PM2:** A process manager for Node.js that will keep your application running.
2.  **Deploy Your Code:** We'll get your code onto the server, install its dependencies, and build the frontend assets.
3.  **Run the Application:** We'll start your application using PM2.
4.  **Configure Nginx:** We'll set up Nginx to direct traffic from the internet to your running application.
5.  **Access Your Website:** You'll be able to browse your website using your server's IP address or a domain name.
6.  **Future-Proofing:** The setup will be ready for you to add more websites in the future.

---

## Step 1: Prepare Your Server

First, you need to connect to your Ubuntu VM. You can usually do this using SSH (Secure Shell). If you're on Windows, you can use a tool like PuTTY or the built-in SSH client in PowerShell or Command Prompt. On macOS or Linux, you can use the `ssh` command in your terminal.

```bash
ssh your_username@your_server_ip
```

Once you're connected, you'll have a command line interface to your server. Let's install the software we need.

### 1.1: Update Your Server's Package Lists

It's always a good idea to start by updating your server's list of available packages.

```bash
sudo apt update
sudo apt upgrade
```

`sudo` is a command that lets you run commands with administrator privileges. `apt` is Ubuntu's package manager.

### 1.2: Install Node.js and npm

Your backend is a Node.js application, so we need to install Node.js. We'll also get `npm` (Node Package Manager), which is used to manage your project's dependencies.

We'll install a recent version of Node.js (version 20 at the time of writing).

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

To verify the installation, you can check the versions:

```bash
node -v
npm -v
```

### 1.3: Install Nginx

Nginx (pronounced "engine-x") will be our web server. It will listen for incoming traffic on port 80 (the standard HTTP port) and forward it to your Node.js application, which will be running on a different port (3000).

```bash
sudo apt install nginx
```

After installing, Nginx should start automatically. You can check its status:

```bash
sudo systemctl status nginx
```

If you open a web browser and navigate to your server's IP address (`http://your_server_ip`), you should see the default Nginx welcome page.

### 1.4: Install PM2

Your Node.js application needs to run continuously. If you just run `node src/app.js`, it will stop as soon as you close your SSH connection. PM2 is a process manager that will keep your app running in the background and even restart it if it crashes.

Install PM2 globally using npm:

```bash
sudo npm install pm2 -g
```

---

## Step 2: Deploy Your Code

Now that the server is ready, let's get your code onto it.

### 2.1: Get Your Code

The easiest way to do this is by cloning your Git repository. If you don't have one, you can upload your files using `scp` or an FTP client like FileZilla.

For this guide, I'll assume you're using Git. First, you'll need to install Git:

```bash
sudo apt install git
```

Now, clone your project. It's good practice to put web projects in the `/var/www` directory.

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <your-git-repository-url>
cd <your-project-directory> # The directory created by git clone
```

### 2.2: Install Dependencies

Your project has two parts with dependencies: `frontend` and `backend`. We need to install them for both.

First, the backend:

```bash
cd backend
npm install
```

Then, the frontend:

```bash
cd ../frontend
npm install
```

### 2.3: Build Frontend Assets

Your frontend uses Tailwind CSS, which needs to be compiled to generate `src/output.css`.

Default: Tailwind CLI
```bash
# In the frontend directory
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css
```
This creates `frontend/src/output.css`, which the backend serves.

#### 2.3.1: Tailwind v4 via PostCSS (recommended if CLI is blocked or you prefer PostCSS)
If you see “Permission denied” when running the Tailwind CLI (common on noexec mounts) or the PostCSS error about using Tailwind directly as a plugin, use the official Tailwind v4 PostCSS plugin.

1) Install dependencies (in the frontend directory):
```bash
cd ~/FMC_GUI/frontend
npm i -D @tailwindcss/postcss postcss postcss-cli autoprefixer
```

2) Update PostCSS config to use the Tailwind v4 plugin. Replace the entire contents of frontend/postcss.config.js with:
```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```
Note: Make sure `'@tailwindcss/postcss'` is quoted to avoid a Node SyntaxError.

3) Build once, then run the watcher:
```bash
# One-off build
cd ~/FMC_GUI/frontend && npx postcss ./src/input.css -o ./src/output.css

# Watch for changes
cd ~/FMC_GUI/frontend && npx postcss ./src/input.css -o ./src/output.css --watch
```
The watcher appears “idle” by design; it rebuilds when `src/input.css` changes. Confirm the link tag in `src/index.html`:
```html
<link href="./output.css" rel="stylesheet">
```

Optional: Add a convenience script to `frontend/package.json`:
```json
{
  "scripts": {
    "css:watch": "npx postcss ./src/input.css -o ./src/output.css --watch"
  }
}
```


### 2.4: Start the Flask FMC API (required by the Node proxy)
The Node backend forwards requests to a Flask API at [FLASK_BASE](backend/src/routes/api.js:16) via [forwardToFlask()](backend/src/routes/api.js:37). Ensure the Flask app in [app.py](ultimate App/app.py:1) is running on the server.

Option A (recommended): virtualenv + PM2
```bash
# Install venv tools
sudo apt-get update && sudo apt-get install -y python3-venv python3-pip

# Create venv, install requirements, and run under PM2
cd "$HOME/FMC_GUI/ultimate App"
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
pm2 start ".venv/bin/python3" --name flask-fmc -- app.py

# Verify Flask is up
curl -sS http://127.0.0.1:5000/ | head -n 1
```

Option B (temporary): run without venv
```bash
cd "$HOME/FMC_GUI/ultimate App"
python3 -m pip install --user -r requirements.txt
pm2 start "python3" --name flask-fmc -- app.py
```

If Flask runs on a different host/port, set FLASK_BASE when starting Node:
```bash
cd "$HOME/FMC_GUI/backend"
pm2 stop my-first-project
FLASK_BASE=http://127.0.0.1:5000 pm2 start src/app.js --name my-first-project
```

## Step 3: Run the Application with PM2

Now we're ready to start your application. We'll use PM2 to do this.

Navigate to your backend directory and start the app:

```bash
cd ../backend
pm2 start src/app.js --name my-first-project
```

- `pm2 start src/app.js`: This tells PM2 to run your application.
- `--name my-first-project`: This gives the process a name, which is useful for managing it later.

You can see a list of your running applications with:

```bash
pm2 list
```

To make sure your application starts automatically when the server reboots, run these commands:

```bash
pm2 startup
# It will give you a command to run, something like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_username --hp /home/your_username
# Copy and paste the command it gives you and run it.
pm2 save
```

Your application is now running and listening on port 3000. However, you can't access it from the outside yet because the server's firewall is likely blocking that port. That's where Nginx comes in.

---

## Step 4: Configure Nginx as a Reverse Proxy

We'll configure Nginx to listen on port 80 and forward requests to your application on port 3000.

### 4.1: Create an Nginx Configuration File

Nginx stores its site configurations in `/etc/nginx/sites-available`. We'll create a new file for your project.

```bash
sudo nano /etc/nginx/sites-available/FMC-Ultimate-Configurator
```

This will open a text editor. Paste the following configuration into it. I've also provided this configuration in a file named `nginx_config_example` in your repository.

```nginx
server {
    listen 80;
    server_name your_server_ip; # Or your domain name, e.g., example.com

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- `listen 80;`: Nginx will listen on port 80.
- `server_name your_server_ip;`: Replace `your_server_ip` with your server's actual IP address. If you have a domain name pointing to your server, use that instead.
- `location / { ... }`: This block applies to all incoming requests.
- `proxy_pass http://localhost:3000;`: This is the magic part. It tells Nginx to forward the request to your Node.js application running on `http://localhost:3000`.

To save the file in `nano`, press `Ctrl+X`, then `Y`, then `Enter`.

### 4.2: Enable the Configuration

Nginx uses a system of symbolic links to enable sites. We need to create a link from `sites-available` to `sites-enabled`.

```bash
sudo ln -s /etc/nginx/sites-available/my-first-project /etc/nginx/sites-enabled/
```

It's a good idea to remove the default Nginx configuration so it doesn't conflict:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Note on site names and symlinks (common error)
If `sudo nginx -t` reports:
```
open() "/etc/nginx/sites-enabled/my-first-project" failed (2: No such file or directory)
```
then the enabled symlink name doesn't match the file in `/etc/nginx/sites-available`. Fix by renaming the file or updating the symlink, for example:
```bash
# Rename site file and refresh the symlink
sudo mv /etc/nginx/sites-available/FMC-Ultimate-Configurator /etc/nginx/sites-available/my-first-project
sudo ln -sf /etc/nginx/sites-available/my-first-project /etc/nginx/sites-enabled/my-first-project
sudo rm -f /etc/nginx/sites-enabled/default
sudo sed -i 's/server_name .*/server_name 172.23.79.100;/' /etc/nginx/sites-available/my-first-project
```

### 4.3: Test and Restart Nginx

Before restarting Nginx, test your configuration to make sure there are no syntax errors:

```bash
sudo nginx -t
```

If it says the test is successful, you're good to go. Restart Nginx to apply the changes:

```bash
sudo systemctl restart nginx
```

---

## Step 5: Access Your Website

You should now be able to open a web browser and navigate to `http://your_server_ip` (or your domain name). You should see your application!

---

## Step 6: Adding Another Project in the Future

You mentioned you want to add another project and link to it. Our current setup is great for that. Here's how you would do it:

Let's say your second project is a blog and you want to access it at `http://your_server_ip/blog`.

1.  **Deploy the second project:**

    - Get the code for the second project onto your server (e.g., in `/var/www/my-blog`).
    - Install its dependencies.
    - Run it with PM2, but on a different port (e.g., 3001):
      ```bash
      pm2 start ... --name my-blog # (and make sure it runs on port 3001)
      ```

2.  **Update the Nginx configuration:**

    - Edit your Nginx configuration file:
      ```bash
      sudo nano /etc/nginx/sites-available/my-first-project
      ```
    - Add a new `location` block for your blog:

      ```nginx
      server {
          listen 80;
          server_name your_server_ip;

          location / {
              proxy_pass http://localhost:3000;
              # ... (the rest of the proxy settings)
          }

          # This is the new part for your second project
          location /blog/ {
              proxy_pass http://localhost:3001/;
              # ... (the rest of the proxy settings)
          }
      }
      ```

    - The trailing slashes in `location /blog/` and `proxy_pass http://localhost:3001/` are important!

3.  **Test and restart Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

Now, `http://your_server_ip` will still go to your first project, and `http://your_server_ip/blog` will go to your new blog project. You can then add a link in your first project's HTML like `<a href="/blog">My Blog</a>`.

---

## Step 7: Updating and Redeploying Changes

When you make changes locally and push to Git, update the server with these steps.

Set your project root (adjust if your repo lives elsewhere):
```bash
# If you cloned under your home directory
export PROJECT_ROOT="$HOME/FMC_GUI"

# If you cloned under /var/www per earlier steps:
# export PROJECT_ROOT="/var/www/&lt;your-project-directory&gt;"
```

1) Pull latest code
```bash
cd "$PROJECT_ROOT"
git pull
```

2) Reinstall dependencies if package files changed
- Backend:
```bash
cd "$PROJECT_ROOT/backend"
npm install
```
- Frontend:
```bash
cd "$PROJECT_ROOT/frontend"
npm install
```

3) Rebuild Tailwind v4 CSS via PostCSS
- Uses [postcss.config.js](frontend/postcss.config.js:1) with '@tailwindcss/postcss'
```bash
cd "$PROJECT_ROOT/frontend"
npx postcss ./src/input.css -o ./src/output.css
```
Notes:
- The backend serves static files from `frontend/src`, so ensure `src/output.css` exists and is up to date.
- The CLI watch mode is not required in production; a one-off build is sufficient.

4) Restart runtime services (PM2)
- Node backend ([app.js](backend/src/app.js:1)):
```bash
pm2 restart my-first-project
# If you changed FLASK_BASE or environment, restart with env:
# pm2 stop my-first-project
# cd "$PROJECT_ROOT/backend" && FLASK_BASE=http://127.0.0.1:5000 pm2 start src/app.js --name my-first-project
```
- Flask API ([app.py](ultimate App/app.py:1)):
```bash
# If you used a venv:
cd "$PROJECT_ROOT/ultimate App"
. .venv/bin/activate
pip install -r requirements.txt
pm2 restart flask-fmc
# If you didn't use a venv:
# python3 -m pip install --user -r requirements.txt && pm2 restart flask-fmc
```
- Save PM2 state (so processes restart on reboot):
```bash
pm2 save
```

5) Reload Nginx only if the Nginx config changed
```bash
sudo nginx -t && sudo systemctl reload nginx
```

6) Verify
```bash
# Backend direct
curl -I http://localhost:3000
# Reverse proxy
curl -I http://your_server_ip
# Flask (default FLASK_BASE)
curl -I http://127.0.0.1:5000
pm2 list
```

Quick summary for common update
```bash
cd "$PROJECT_ROOT" && git pull \
&& cd backend && npm install && pm2 restart my-first-project \
&& cd ../frontend && npm install && npx postcss ./src/input.css -o ./src/output.css \
&& cd ../"ultimate App" && pm2 restart flask-fmc \
&& sudo nginx -t && sudo systemctl reload nginx
```
## Troubleshooting

- Tailwind v4 + PostCSS error:
  If you see: “It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin… install `@tailwindcss/postcss`…”
  - Fix:
    ```bash
    cd ~/FMC_GUI/frontend
    npm i -D @tailwindcss/postcss postcss postcss-cli autoprefixer
    ```
    ```js
    module.exports = {
      plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {},
      },
    };
    ```
  - Build using PostCSS:
    ```bash
    npx postcss ./src/input.css -o ./src/output.css
    ```

- Tailwind CLI “Permission denied”:
  The v4 CLI is a platform binary and can be blocked on noexec filesystems. Use the PostCSS setup in section 2.3.1.

- UI shows “Connection error: Proxy error”:
  The Node backend couldn’t reach the Flask API (default `FLASK_BASE` http://127.0.0.1:5000). Start Flask as described in section 2.4 and verify:
  ```bash
  curl -I http://127.0.0.1:5000
  pm2 logs flask-fmc --lines 100
  ```

- Nginx missing site file:
  If Nginx references a non-existent site (e.g., `my-first-project`), fix the symlink or rename the site file as shown in the Note in section 4.2, then:
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```

---

That's it! You now have a robust setup for your web applications. If you have any questions, feel free to ask!
