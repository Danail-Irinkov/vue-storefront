export default interface StoreDataState {
  banners: {
    mainBanners: any[],
    smallBanners: any[],
    productBanners: any[]
  },
  currentStore: any,
  headImage: Record<string, any>
}
