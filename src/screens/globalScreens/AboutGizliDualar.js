import React, { useEffect } from 'react';
import { ScrollView, View, Text, Platform } from 'react-native';
import { DeviceLanguage, LangApp } from '../../components/Language';

// import * as InAppPurchases from 'expo-in-app-purchases';

export const AboutGizliDualar = (props) => {
  useEffect(() => {
 
    props.navigation.setOptions({ title: LangApp("blBig")})
  }, [])

 


  async function purchaseProduct() {
    // var InAppPurchases= require("expo-in-app-purchases")

  }



 let icr=<></>


if (DeviceLanguage!="ar") {
  icr=<View style={{ margin: 10, flex: 1 }}>
  
  <View >

    <Text on onPress={purchaseProduct} style={{ fontWeight: "bold", color: "blue", fontSize: 20, marginBottom: 5 }}> Gizli Dualar Nedir?</Text>
    <Text style={{ fontSize: 16 }}>      Gizli Dular "havas" ilmi üzerine yoğunlaşmıştır.
      <Text style={{ padding: 3, color: "red", fontWeight: "bold" }}> Havas ilmi; İlme vakıf ulemanın, Kuran-ı Kerim'in ayet ve surelerinden çeşitli zikir, dua ve vefkler ile şifa uyguladığı bir ilimdir.</Text>
    </Text>
    <View>
      <Text style={{ fontSize: 16 }}>      Bizler bu ilme vakıf olan kişiler ve kaynaklardan derlediklerimizi sizlerin bilgilerine sunuyoruz</Text>
    </View>
  </View>

  <View style={{ marginTop: 30}}>
    <Text style={{ fontWeight: "bold", color: "blue", fontSize: 20, marginBottom: 5 }}> Neden Ücretli?</Text>
    <Text style={{ fontSize: 16 }}>      
      <Text>  Her duanın kaynağının bulunması ve araştırılmasında sarf edilen emeğe göre, hocalarımıza ulaşmak ve ekibin çalışabilmesini sağlamak için hizmet ücrete tabi tutlmuştur. </Text>
    </Text>
    <View>
      <Text style={{ padding: 3, color: "red", fontWeight: "bold", fontSize: 16 }}>    Ekibimizin uygulamadaki dua vefk ve zikir gibi birçok içeriğin derlenmesi sırasında, birçok hatrı sayılır hocalar, mekanlar ziyarete gidilmiş ve kaynak çıkarılmıştır. Tesirler istiarelerle desteklenmiş, uygulanan duaların belirli zaman içinde sonuca ulaştığı tespiti sağlanmıştır.</Text>
    </View>
  </View>
  <View style={{
    marginBottom: 30, flex: 1, alignItems: "flex-end", flexDirection: "row",
  }}>
    <View style={{
      backgroundColor: "#fbdada", width: "100%", padding: 5, borderRadius: 5,
      borderStyle: "dotted",
      borderWidth: 1,
      borderColor: "red"
    }}>
      <Text style={{
        fontWeight: "bold", fontSize: 20, textAlign: "center",

      }}>Gizli Dualar uygulaması, arkasında yıllarını Kuran-ı Kerim'in şifa ve mucizelerine adamış ekip barındırmaktadır.</Text>

    </View>
  </View>

</View>
} else {
  icr=<View style={{ margin: 10, flex: 1 }}>
  
  <View >

    <Text on onPress={purchaseProduct} style={{ fontWeight: "bold", color: "blue", fontSize: 20, marginBottom: 5 }}> ما هي الأدعية الخفية؟</Text>
    <Text style={{ fontSize: 16 }}>      الأدعية الخفية تركز على علم "الحواس".
      <Text style={{ padding: 3, color: "red", fontWeight: "bold" }}> علم الحواس؛ هو علم يتضمن استخدام العلماء الملمين به آيات وسور من القرآن الكريم لتحقيق الشفاء من خلال الأذكار والأدعية والحروف.</Text>
    </Text>
    <View>
      <Text style={{ fontSize: 16 }}>      نحن نقدم لكم ما جمعناه من أشخاص ملمين بهذا العلم ومن مصادر موثوقة.</Text>
    </View>
  </View>

  <View style={{ marginTop: 30}}>
    <Text style={{ fontWeight: "bold", color: "blue", fontSize: 20, marginBottom: 5 }}> لماذا هو مدفوع؟</Text>
    <Text style={{ fontSize: 16 }}>      
      <Text>  نظراً للجهد المبذول في جمع المصادر لكل دعاء والبحث فيها، وللتواصل مع علماءنا وضمان عمل الفريق، تم جعل الخدمة مدفوعة.</Text>
    </Text>
    <View>
      <Text style={{ padding: 3, color: "red", fontWeight: "bold", fontSize: 16 }}>    خلال جمع محتوى الأدعية والأذكار والحروف، قمنا بزيارة العديد من العلماء المعتبرين والأماكن واستخراج المصادر. تم دعم التأثيرات بالاستخارة وتم التأكد من أن الأدعية المطبقة تصل إلى النتائج المطلوبة في وقت معين.</Text>
    </View>
  </View>
  <View style={{
    marginBottom: 30, flex: 1, alignItems: "flex-end", flexDirection: "row",
  }}>
    <View style={{
      backgroundColor: "#fbdada", width: "100%", padding: 5, borderRadius: 5,
      borderStyle: "dotted",
      borderWidth: 1,
      borderColor: "red"
    }}>
      <Text style={{
        fontWeight: "bold", fontSize: 20, textAlign: "center",

      }}>تطبيق الأدعية الخفية يضم فريقاً أمضى سنوات في تكريس حياته لمعجزات وشفاء القرآن الكريم.</Text>

    </View>
  </View>

</View>

}
  return (
   icr

  );
}



// import React, { useEffect, useState } from 'react';
// import { Platform, Text, View } from 'react-native';

// import  Purchases from 'react-native-purchases';

// const APIKeys = {
//   apple: "appl_DMIkzFAHBAAkVwsdeTjaNnWZKYX",
//   google: "goog_OfndwmvoPjhIPGFfcHLzfGuYPIR",
// };

// export const AboutGizliDualar = (props) => {
//   const [currentOffering, setCurrentOffering] = useState(null);
//   const [packages, setPackages] = useState([]);

//   useEffect(() => {
  
//     const setup = async () => {
     
//       if (Platform.OS == "android") {
   
//         await Purchases.configure({ apiKey: APIKeys.google });
//       } 
   
//       else {  
//         await Purchases.configure({ apiKey: APIKeys.apple });
//       } 
      
//       const offerings = await Purchases.getOfferings()
//       // console.log("ddddd", "offerings")
    
//         console.log("ddddd", offerings.current.availablePackages) 
//       setPackages(offerings.current.availablePackages); 
           
//       Purchases.setDebugLogsEnabled(true)
//     };  
    
       

//     setup() 
//       .catch(console.log);
//   }, []);
//   const setPurchasesPackage = async (p) => {
//   var sda= await Purchases.purchasePackage(p)

//   }
//   if (!packages) {
//     return <Text>Loading...</Text>
//   } else {
//     return (
//       <View>
//         {/* <Text>Current Offering: {currentOffering.identifier}</Text>
//         <Text>Package Count: {currentOffering.availablePackages.length}</Text> */}
//         {
//           packages.map((pkg,key) => {
//             return <Text key={key} onPress={()=>setPurchasesPackage(pkg)}>{ pkg.product.description }</Text>
//           })
//         }
//       </View>
//     );
//   }
// }