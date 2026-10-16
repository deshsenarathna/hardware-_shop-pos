package com.hardwarepos.hardware_pos_backend.product;

import java.math.BigDecimal;

public class NewSaleProductResponse {

    private final Long id;
    private final String productCode;
    private final String name;
    private final BigDecimal sellingPrice;

    public NewSaleProductResponse(

            Long id,
            String productCode,
            String name,
            BigDecimal sellingPrice
    ){

        this.id = id;
        this.productCode = productCode;
        this.name = name;
        this.sellingPrice = sellingPrice;
    }

    public Long getId() { return id;}

    public String getProductCode() {
        return productCode;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }
}
