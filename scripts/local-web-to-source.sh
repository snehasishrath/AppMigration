sshpass -p compute@12#$ ssh -o StrictHostKeyChecking=no root@10.30.53.68 apt-get install sshpass -y
sshpass -p compute@12#$ rsync migration-script.sh root@10.30.53.68
sshpass -p compute@12#$ ssh -o StrictHostKeyChecking=no root@10.30.53.68 chmod +x migration-script.sh
sshpass -p compute@12#$ ssh -o StrictHostKeyChecking=no root@10.30.53.68 bash migration-script.sh