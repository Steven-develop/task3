-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 02, 2026 at 07:10 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `srms`
--

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customerNumber` int(11) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customerNumber`, `firstName`, `lastName`, `telephone`, `address`) VALUES
(1, 'samuel', 'Ken-r', '0789934343', 'Musanze');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `productCode` varchar(20) NOT NULL,
  `productName` varchar(100) NOT NULL,
  `quantitySold` int(11) DEFAULT 0,
  `unitPrice` decimal(10,2) NOT NULL,
  `quantityInStock` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`productCode`, `productName`, `quantitySold`, `unitPrice`, `quantityInStock`) VALUES
('PRD-123', 'Rice', 12, 1200.00, 0);

-- --------------------------------------------------------

--
-- Table structure for table `sale`
--

CREATE TABLE `sale` (
  `invoiceNumber` varchar(20) NOT NULL,
  `salesDate` date NOT NULL,
  `paymentMethod` enum('Cash','Credit Card','Debit Card','Online') NOT NULL,
  `totalAmountPaid` decimal(10,2) DEFAULT 0.00,
  `customerNumber` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale`
--

INSERT INTO `sale` (`invoiceNumber`, `salesDate`, `paymentMethod`, `totalAmountPaid`, `customerNumber`) VALUES
('123', '2026-06-02', 'Online', 14400.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `saleitem`
--

CREATE TABLE `saleitem` (
  `invoiceNumber` varchar(20) NOT NULL,
  `productCode` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `priceAtSale` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saleitem`
--

INSERT INTO `saleitem` (`invoiceNumber`, `productCode`, `quantity`, `priceAtSale`) VALUES
('123', 'PRD-123', 12, 1200.00);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `passwordHash`, `createdAt`) VALUES
(1, 'steven', '$2b$10$LlgXqDzgcL8OoQwZT/uHQOk0xEZ/tzJPaiC44PxbyHn.iXxOnVMte', '2026-06-02 16:45:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customerNumber`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`productCode`);

--
-- Indexes for table `sale`
--
ALTER TABLE `sale`
  ADD PRIMARY KEY (`invoiceNumber`),
  ADD KEY `customerNumber` (`customerNumber`);

--
-- Indexes for table `saleitem`
--
ALTER TABLE `saleitem`
  ADD PRIMARY KEY (`invoiceNumber`,`productCode`),
  ADD KEY `productCode` (`productCode`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `customerNumber` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sale`
--
ALTER TABLE `sale`
  ADD CONSTRAINT `sale_ibfk_1` FOREIGN KEY (`customerNumber`) REFERENCES `customer` (`customerNumber`);

--
-- Constraints for table `saleitem`
--
ALTER TABLE `saleitem`
  ADD CONSTRAINT `saleitem_ibfk_1` FOREIGN KEY (`invoiceNumber`) REFERENCES `sale` (`invoiceNumber`) ON DELETE CASCADE,
  ADD CONSTRAINT `saleitem_ibfk_2` FOREIGN KEY (`productCode`) REFERENCES `product` (`productCode`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
