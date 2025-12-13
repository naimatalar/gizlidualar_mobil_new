import { GetAxiosAnonym } from "./crud";

// const baseUrl = 'http://192.168.1.9:45455';
const baseUrl = 'https://sda.detambilgislem.biz.tr';
  
const apiConstant = {
    IMAGEBASEURL: baseUrl + '/root/UploadedImages',
    AUDIOBASEURL: baseUrl + '/root/SureMp3', // Ses dosyaları için base URL
    SEARCH: baseUrl + '/api/Search/search', 
    GET_PRODUCT_BY_COMPANYID: baseUrl + '/api/Product/getProductByCompanyId',
    BaseUrl: baseUrl,
    SignalRHubUrl: baseUrl + '/userhub'

    
} 
export default apiConstant

 