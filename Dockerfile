FROM nginx:alpine
# Copia solo lo que sirve la web; .git, Dockerfile, compose y docs quedan fuera.
COPY index.html /usr/share/nginx/html/index.html
COPY assets /usr/share/nginx/html/assets
