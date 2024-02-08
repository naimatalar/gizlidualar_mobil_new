import { GetAxiosAnonym } from "./crud";

// const baseUrl = 'http://192.168.0.14:5001';
const baseUrl = 'http://91.151.89.180:8888';
 
const apiConstant = {
    IMAGEBASEURL: baseUrl + '/root/upload',
    SEARCH: baseUrl + '/api/Search/search', 
    GET_PRODUCT_BY_COMPANYID: baseUrl + '/api/Product/getProductByCompanyId',
    BaseUrl: baseUrl 

    
} 
export default apiConstant

