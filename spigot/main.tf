provider "aws" {
  region = "us-west-2"
}

provider "tls" {
}

terraform {
  backend "s3" {
    bucket = "mc-nathanhleung"
    key    = "terraform"
    region = "us-west-2"
  }
}

# Existing EIP from previous Minecraft server
data "aws_eip" "ip" {
  public_ip = "52.32.225.240"
}

data "aws_s3_bucket" "mc-nathanhleung" {
  bucket = "mc-nathanhleung"
}

data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

resource "aws_iam_access_key" "key" {
  user = aws_iam_user.spigot.name
}

resource "aws_iam_user" "spigot" {
  name = "spigot"
}

resource "aws_iam_user_policy" "spigot" {
  name = "test"
  user = aws_iam_user.spigot.name

  policy = <<-EOF
    {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "VisualEditor0",
              "Effect": "Allow",
              "Action": "s3:ListBucket",
              "Resource": "arn:aws:s3:::${data.aws_s3_bucket.mc-nathanhleung.bucket}"
          },
          {
              "Sid": "VisualEditor1",
              "Effect": "Allow",
              "Action": [
                  "s3:*"
              ],
              "Resource": "arn:aws:s3:::${data.aws_s3_bucket.mc-nathanhleung.bucket}/*"
          }
      ]
    }
EOF
}

resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "generated_key" {
  key_name   = "mc-nathanhleung"
  public_key = tls_private_key.key.public_key_openssh
}

resource "aws_security_group" "minecraft" {
  name = "minecraft"

  ingress {
    description = "Minecraft"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Minecraft"
    from_port   = 25565
    to_port     = 25565
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "minecraft"
  }
}

resource "aws_instance" "server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  tags = {
    Name = "spigot"
  }
  key_name        = aws_key_pair.generated_key.key_name
  security_groups = [aws_security_group.minecraft.name]
  user_data       = <<-EOF
		#! /bin/bash
    cd /srv
    sudo apt-get update
    # https://github.com/pypa/get-pip/issues/43
    sudo apt-get -y install python3 python3-distutils
    curl -O https://bootstrap.pypa.io/get-pip.py
    python3 get-pip.py --user
    echo 'export PATH=~/.local/bin:$PATH' >> ~/.bash_profile
    echo 'export AWS_ACCESS_KEY_ID=${aws_iam_access_key.key.id}' >>  ~/.bash_profile
    echo 'export AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.key.secret}' >>  ~/.bash_profile
    source ~/.bash_profile
    pip3 install awscli --upgrade --user
    aws s3 cp s3://${data.aws_s3_bucket.mc-nathanhleung.bucket}/spigot.jar spigot.jar
	EOF
}

resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.server.id
  allocation_id = data.aws_eip.ip.id
}
