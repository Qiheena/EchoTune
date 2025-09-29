# Dockerfile
# Yeh file Render ko bataati hai ki Node.js environment ko kaise setup karna hai

# 1. Base Image: Node.js version 18 ka use karein
FROM node:18-alpine

# 2. Working Directory set karein
WORKDIR /usr/src/app

# 3. Zaroori files ko copy karein
# package.json aur package-lock.json ko copy karke dependencies install karein (Fast build ke liye)
COPY package*.json ./
RUN npm install

# 4. Baaki saare code files ko copy karein
COPY . .

# 5. Application ko shuru karne ke liye command define karein
CMD [ "node", "index.js" ]

# Note: Aapko apne Discord Token, Firebase Config, aur YouTube API Key ko
# Render ke environment variables mein set karna hoga (jaise: DISCORD_TOKEN)
