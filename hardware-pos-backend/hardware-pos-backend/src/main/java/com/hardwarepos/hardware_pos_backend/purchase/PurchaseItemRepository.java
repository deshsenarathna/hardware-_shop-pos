package com.hardwarepos.hardware_pos_backend.purchase;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {

    List<PurchaseItem> findByPurchase(Purchase purchase);

    List<PurchaseItem> findByPurchaseId(Long purchaseId);
}
