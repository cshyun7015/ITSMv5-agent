FROM quay.io/ansible/creator-ee:latest

USER root

# Install necessary Python packages for Windows management and DB management
RUN pip install --no-cache-dir \
    pywinrm \
    pymysql \
    cryptography

# No USER instruction needed if we stay as root, or let it inherit from base.
