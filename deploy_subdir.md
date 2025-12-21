# Deployment: Adding to Existing Server

Since you want to add this project to your existing server under a sub-path (e.g., `your-server.com/topology-builder`), follow these steps.

## 1. Build the Project
Run this command on your local machine (or on the server if you clone the repo there):

```bash
npm run build
```

This creates a `dist` folder with all your static files. This project is a robust frontend application and does not require a Node.js backend process—Nginx can serve it directly, which is faster and more efficient.

## 2. Copy to Server
Move the `dist` folder to your server.

**Option A: Command Line (SCP)**
Run this from your **local** terminal (Powershell or Command Prompt):
```bash
# Syntax: scp -r <local-path> <user>@<server-ip>:<remote-path>
scp -r ./dist user@your_server_ip:/tmp/topology-dist
```
Then on the **server**, move it to the final location:
```bash
sudo rm -rf /var/www/topology-builder/dist
sudo mkdir -p /var/www/topology-builder
sudo mv /tmp/topology-dist /var/www/topology-builder/dist
```

**Option B: FileZilla (Visual)**
1. Open FileZilla and connect to your server using SFTP.
2. Navigate to `/var/www/topology-builder` on the right side (Server).
3. Drag the `dist` folder from your left side (Local) to the server.

## 3. Configure Nginx
Edit your existing Nginx config file:
```bash
sudo nano /etc/nginx/sites-available/my-first-project
```

Add this new `location` block inside your `server` block:

```nginx
    # Topology Builder Configuration
    location /topology-builder/ {
        alias /var/www/topology-builder/dist/;
        try_files $uri $uri/ /topology-builder/index.html;
    }
```

## 4. Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

Now you can access the app at: `http://your_server_ip/topology-builder/`
