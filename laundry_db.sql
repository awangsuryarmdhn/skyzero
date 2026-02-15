-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2026 at 06:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laundry_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activitylog`
--

CREATE TABLE `activitylog` (
  `id` int(11) NOT NULL,
  `action` varchar(191) NOT NULL,
  `details` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activitylog`
--

INSERT INTO `activitylog` (`id`, `action`, `details`, `createdAt`) VALUES
(1, 'UPDATE_PAYMENT', 'Resi 260209-2349-K: Pembayaran diubah menjadi LUNAS', '2026-02-09 17:27:35.716'),
(2, 'UPDATE_STATUS', 'Resi 260209-2330-E: Status berubah dari WASHING ke COMPLETED', '2026-02-09 17:31:26.119'),
(3, 'UPDATE_PAYMENT', 'Resi 260209-2330-E: Pembayaran diubah menjadi LUNAS', '2026-02-09 17:31:35.145'),
(4, 'CREATE_ORDER', 'Pesanan baru dibuat: Santoso (260209-0031-E)', '2026-02-09 17:31:58.027'),
(5, 'CREATE_ORDER', 'Pesanan baru dibuat: Cherki (260209-0040-K)', '2026-02-09 17:40:53.008'),
(6, 'UPDATE_STATUS', 'Resi 260209-0040-K: Status berubah dari PENDING ke COMPLETED', '2026-02-09 18:28:20.418'),
(7, 'CREATE_ORDER', 'Pesanan baru dibuat: Dorku (260209-0128-E)', '2026-02-09 18:28:47.209'),
(8, 'UPDATE_STATUS', 'Resi 260209-0128-E: Status berubah dari PENDING ke COMPLETED', '2026-02-09 18:29:00.179'),
(9, 'UPDATE_STATUS', 'Resi 260209-0128-E: Status berubah dari COMPLETED ke WASHING', '2026-02-09 18:29:06.017'),
(10, 'CREATE_ORDER', 'Pesanan baru dibuat: Dwi Gans (260211-1105-E)', '2026-02-11 04:05:19.335'),
(11, 'DELETE_ORDER', 'Pesanan Ayam (202602071955-02) telah DIHAPUS PERMANEN', '2026-02-11 04:40:30.263'),
(12, 'DELETE_ORDER', 'Pesanan Rocky (202602091319-02) telah DIHAPUS PERMANEN', '2026-02-11 04:40:35.521'),
(13, 'DELETE_ORDER', 'Pesanan Awang (260209-1453-K) telah DIHAPUS PERMANEN', '2026-02-11 04:40:45.946'),
(14, 'DELETE_ORDER', 'Pesanan Dorku (260209-0128-E) telah DIHAPUS PERMANEN', '2026-02-11 04:44:03.094'),
(15, 'DELETE_ORDER', 'Pesanan Cherki (260209-0040-K) telah DIHAPUS PERMANEN', '2026-02-11 04:47:00.038'),
(16, 'CREATE_ORDER', 'Pesanan baru dibuat: Awang (SKY-5FX8723)', '2026-02-11 04:48:03.582'),
(17, 'CREATE_ORDER', 'Pesanan baru dibuat: Dwi (SKY-DRX2333)', '2026-02-11 04:48:23.750'),
(18, 'CREATE_ORDER', 'Pesanan baru dibuat: Bruno (SKY-0P76775)', '2026-02-11 04:48:49.829'),
(19, 'CREATE_ORDER', 'Pesanan baru dibuat: Buffon (SKY-88M8987)', '2026-02-11 04:49:36.454'),
(20, 'CREATE_ORDER', 'Pesanan baru dibuat: Casilas (SKY-Z687896)', '2026-02-11 04:49:51.959'),
(21, 'CREATE_ORDER', 'Pesanan baru dibuat: Owen (SKY-1155342)', '2026-02-11 04:50:24.895');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` varchar(191) NOT NULL,
  `customerName` varchar(191) NOT NULL,
  `weight` double NOT NULL,
  `serviceType` enum('KILOAN','SATUAN','EXPRESS') NOT NULL,
  `totalPrice` double NOT NULL,
  `status` enum('PENDING','WASHING','IRONING','READY','COMPLETED') NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `isPaid` tinyint(1) NOT NULL DEFAULT 0,
  `phoneNumber` varchar(191) NOT NULL DEFAULT '-'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id`, `customerName`, `weight`, `serviceType`, `totalPrice`, `status`, `createdAt`, `updatedAt`, `orderId`, `isPaid`, `phoneNumber`) VALUES
('1ebaaeff-50a8-4d1a-ac9d-ec1cc2b4db86', 'Budi', 4, 'KILOAN', 60000, 'COMPLETED', '2026-02-09 16:30:38.760', '2026-02-09 17:31:35.133', '260209-2330-E', 1, '-'),
('288f7566-66ce-4073-91b4-21bf5ef9d81c', 'Owen', 1, 'SATUAN', 10000, 'PENDING', '2026-02-11 04:50:24.885', '2026-02-11 04:50:24.885', 'SKY-1155342', 1, '0878755342'),
('3a3e7be2-1a9b-4c3c-a4d3-953191e43fa7', 'Awang', 1, 'KILOAN', 7000, 'PENDING', '2026-02-11 04:48:03.571', '2026-02-11 04:48:03.571', 'SKY-5FX8723', 0, '08988723'),
('41ccd7a7-a05b-48b3-b680-7fee1625fa81', 'Dwi', 1, 'KILOAN', 7000, 'PENDING', '2026-02-11 04:48:23.738', '2026-02-11 04:48:23.738', 'SKY-DRX2333', 0, '089882333'),
('526d2409-4fcb-4267-9571-584c3debb61c', 'ss', 1, 'KILOAN', 7000, 'COMPLETED', '2026-02-09 16:49:11.190', '2026-02-09 17:27:35.712', '260209-2349-K', 1, '-'),
('55024d85-020f-451b-818c-1af5f14e4398', 'Bruno', 1, 'EXPRESS', 15000, 'PENDING', '2026-02-11 04:48:49.819', '2026-02-11 04:48:49.819', 'SKY-0P76775', 0, '0898876775'),
('56972b81-cee7-46b7-b58f-b35b6e6f80f8', 'Casilas', 1, 'KILOAN', 7000, 'PENDING', '2026-02-11 04:49:51.949', '2026-02-11 04:49:51.949', 'SKY-Z687896', 0, '08988877896'),
('5f95ba31-2593-42c4-838c-1aeb3cf71dc3', 'Dwi Gans', 3, 'EXPRESS', 45000, 'PENDING', '2026-02-11 04:05:19.330', '2026-02-11 04:05:19.330', '260211-1105-E', 0, '089676347255'),
('6272be9c-208e-4427-831b-ffad8c4e89ce', 'Buffon', 1, 'KILOAN', 7000, 'PENDING', '2026-02-11 04:49:36.450', '2026-02-11 04:49:36.450', 'SKY-88M8987', 0, '0877668987'),
('872b4781-da84-4a01-91af-5e3ddb0bc50b', 'Krista', 1, 'SATUAN', 10000, 'COMPLETED', '2026-02-09 16:18:28.070', '2026-02-09 16:36:22.194', '260209-2318-S', 1, '-'),
('cc157158-cfd4-471b-ac92-41376be31bde', 'Santoso', 1, 'EXPRESS', 15000, 'PENDING', '2026-02-09 17:31:58.021', '2026-02-09 17:31:58.021', '260209-0031-E', 0, '-');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `name`, `createdAt`) VALUES
(1, 'admin@skylaundry.com', '$2b$10$zYMamGD1927WKINM82ktZeCaaBhgjFKgr2c2aZae.zq5cupyg1RAq', 'Super Admin', '2026-02-08 15:07:30.807');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('30a31bb2-4f82-4cbd-9fe4-75151bbea4a1', 'a3a528bea5435e243d65969a60f66df860ff4c8645375172bd341afca85cca2a', '2026-02-08 14:27:06.592', '20260208142706_allen', NULL, NULL, '2026-02-08 14:27:06.542', 1),
('445c453c-576f-4a7c-b1d3-579a585c35f7', '111ccf18a108051946a7db46bc91dc0b04835852131f8ff61f7c3323312169f0', '2026-02-07 09:15:21.652', '20260207091521_init_tables', NULL, NULL, '2026-02-07 09:15:21.646', 1),
('51324173-e3e1-400a-9d08-948123fdc964', 'b7e16f6cef5f008a9d2f48ac94718c2b3e99548710b0728450faeaa4f52a8dd9', '2026-02-09 17:15:58.649', '20260209171558_add_activity_log', NULL, NULL, '2026-02-09 17:15:58.642', 1),
('6ec44ecf-b8de-4dcd-9040-8579d1acbe87', 'a14b9f3a774c9f756fd3b8b0959aec17342364ab1db6f18bf13baa9591ee97ef', '2026-02-11 03:52:38.028', '20260211035237_add_phone_number', NULL, NULL, '2026-02-11 03:52:38.015', 1),
('b34531b8-613d-4373-a044-76c8b52d1989', '7d0ff4b828d64e0495ccb841303dd2f30a654c5f1b6be0fb849acbf6c7282b2a', '2026-02-09 07:43:45.846', '20260209074345_add_payment_status', NULL, NULL, '2026-02-09 07:43:45.828', 1),
('d191d4f3-ab3c-430f-9880-ba3869536ed4', '5c11a92969ab5417fed0264459e212016b67045a2b5644859c44c6cf3d7bffde', '2026-02-07 12:50:23.682', '20260207125023_allen', NULL, NULL, '2026-02-07 12:50:23.669', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Order_orderId_key` (`orderId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activitylog`
--
ALTER TABLE `activitylog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `data` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for table `sessions`
--

ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for table `settings`
--

ALTER TABLE `settings`
  ADD PRIMARY KEY (`setting_key`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
