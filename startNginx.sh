docker run --name=ui -d -p 80:80 -v /home/panbin/cidashboard/dist:/usr/share/nginx/html -v /home/panbin/cidashboard/default.conf:/etc/nginx/conf.d/default.conf nginx
