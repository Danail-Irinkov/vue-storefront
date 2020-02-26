const createShippingInfoData = (methodsData) => ({
  shippingAddress: {
    countryId: methodsData.country,
    ...(methodsData.shippingAddress ? methodsData.shippingAddress : {})
  },
  billingAddress: {
    ...(methodsData.billingAddress ? methodsData.billingAddress : {})
  },
  // Edited by shabbir because get selected shipping method
  // shippingCarrierCode: methodsData.carrier_code,
  // shippingMethodCode: methodsData.method_code,
  selectedShippingMethods:methodsData.selectedShippingMethods
});

export default createShippingInfoData
