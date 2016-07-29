sshpass -p compute6 ssh -o StrictHostKeyChecking=no root@10.30.53.76 apt-get install sshpass -y 
sshpass -p compute6 rsync migration-script.sh root@10.30.53.76
sshpass -p compute6 ssh -o StrictHostKeyChecking=no root@10.30.53.76 chmod +x migration-script.sh 
sshpass -p compute6 ssh -o StrictHostKeyChecking=no root@10.30.53.76 bash migration-script.sh 
