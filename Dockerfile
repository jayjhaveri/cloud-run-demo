# Use Node.js 18 as the base image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project
COPY . .

# 🔥 Compile TypeScript
RUN npm run build

# Expose the correct port for Cloud Run
EXPOSE 8080

# Start the compiled server
CMD ["npm", "start"]