import { GetAxiosAnonym } from "./crud";

// const baseUrl = 'http://192.168.0.14:5001';
const baseUrl = 'https://sda.detambilgislem.biz.tr';
 
const apiConstant = {
    IMAGEBASEURL: baseUrl + '/root/upload',
    SEARCH: baseUrl + '/api/Search/search', 
    GET_PRODUCT_BY_COMPANYID: baseUrl + '/api/Product/getProductByCompanyId',
    BaseUrl: baseUrl 

    
} 
export default apiConstant

