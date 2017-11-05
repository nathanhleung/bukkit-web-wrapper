CREATE TABLE IF NOT EXISTS `membership_status_hist` (
  `user_id` int(11) NOT NULL,
  `db_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(100) DEFAULT NULL,
  `comment` mediumtext,
  KEY `FK_MEM_STATUS_HIST_USER_ID_idx` (`user_id`),
  CONSTRAINT `FK_MEM_STATUS_HIST_USER_ID` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `user_info` (
  `user_id` int(11) NOT NULL,
  `fingerprint` mediumtext,
  `ip_address` varchar(45) DEFAULT NULL,
  `log_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `FK_USER_INFO_USER_ID_idx` (`user_id`),
  CONSTRAINT `FK_USER_INFO_USER_ID` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` int(11) NOT NULL,
  `name` varchar(500) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `minecraft_user` varchar(16) DEFAULT NULL,
  `pass` char(56) DEFAULT NULL,
  `perm_level` varchar(100) DEFAULT 'default',
  `membership_status` varchar(100) DEFAULT 'pending',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UC_EMAIL` (`email`),
  UNIQUE KEY `UC_MC_USER` (`minecraft_user`),
  UNIQUE KEY `UC_NAME` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='this table will be used to store data about each user';
