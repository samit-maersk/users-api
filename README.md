# users-api

Steps to run this application on a Linux VM.
> This example are taken from a ubuntu vm. If you are not using a ubuntu vm , make sure you change the necessary path, commond in the below example.

```bash
git clone https://github.com/samit-maersk/users-api.git

wget https://nodejs.org/dist/v18.16.1/node-v18.16.1-linux-x64.tar.xz

tar -xvf node-v18.16.1-linux-x64.tar.xz

cd /home/ubuntu/users-api
#change the USER, PASSWORD and HOST details in start.sh by following vi editor tips 

vi start.sh 
# press i for edit mode
# make the change
# press :
# wq! and press enter , for save and exit from vi editor
/home/ubuntu/node-v18.16.1-linux-x64/bin/node /home/ubuntu/node-v18.16.1-linux-x64/bin/npm install

sudo cp usersapi.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl start postgresapi.service
sudo systemctl status postgresapi.service
sudo systemctl enable postgresapi.service

```