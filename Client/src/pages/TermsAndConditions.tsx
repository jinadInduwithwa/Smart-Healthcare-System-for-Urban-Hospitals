import { useState } from "react";

const TermsAndConditions = () => {
  const [language, setLanguage] = useState<"en" | "si">("en");

  const content = {
    en: {
      title: "FoodyX Terms and Conditions",
      effectiveDate: "Effective Date: April 25, 2025",
      sections: [
        {
          title: "1. Introduction",
          body: [
            "Welcome to FoodyX, a leading food ordering and delivery platform connecting customers with restaurants and delivery personnel across Sri Lanka. These Terms and Conditions (“Terms”) govern your use of the FoodyX platform, including our web and mobile interfaces, ordering services, restaurant management tools, delivery operations, and payment systems. By accessing or using FoodyX, you agree to be bound by these Terms. If you do not agree, please do not use the platform.",
            "FoodyX is operated by FoodyX Technologies, a Sri Lankan company committed to delivering a seamless and secure dining experience through a modern, microservices-based architecture.",
          ],
        },
        {
          title: "2. Definitions",
          body: [
            "<ul class='list-disc pl-6'><li><strong>Customer</strong>: A user who browses restaurants, places orders, tracks deliveries, and makes payments.</li><li><strong>Restaurant Admin</strong>: A restaurant owner or manager who manages menus, accepts orders, and handles payments.</li><li><strong>Delivery Personnel</strong>: A driver who fulfills delivery orders assigned by FoodyX.</li><li><strong>Admin</strong>: A FoodyX administrator who oversees user accounts, restaurant verifications, and financial transactions.</li><li><strong>Platform</strong>: FoodyX’s web and mobile interfaces, APIs, and related services.</li></ul>",
          ],
        },
        {
          title: "3. Platform Services",
          body: [
            "FoodyX provides a comprehensive suite of services, including:",
            "<ul class='list-disc pl-6'><li><strong>Browsing and Ordering</strong>: Customers can explore restaurant menus, add items to a cart, place orders, and modify them before confirmation.</li><li><strong>Restaurant Management</strong>: Restaurant Admins can add, update, or remove menu items, set availability, and manage orders.</li><li><strong>Delivery</strong>: Orders are assigned to Delivery Personnel based on location and availability, with real-time tracking for Customers.</li><li><strong>Payments</strong>: Secure transactions via Sri Lankan gateways (PayHere, Dialog Genie, FriMi) or international services (Stripe, PayPal sandbox).</li><li><strong>Notifications</strong>: Customers receive order confirmations via SMS and email; Delivery Personnel get real-time assignment alerts.</li></ul>",
            "You agree to use the Platform lawfully and in accordance with these Terms.",
          ],
        },
        {
          title: "4. Restaurant Registration",
          body: [
            "Restaurants wishing to join FoodyX must complete a registration process, subject to verification by FoodyX Admins. By registering, Restaurant Admins agree to:",
            "<ul class='list-disc pl-6'><li>Provide accurate and complete information, including business licenses, menu details, and contact information.</li><li>Undergo verification by FoodyX to ensure compliance with Sri Lankan food safety and business regulations.</li><li>Pay applicable fees, including platform commissions (as agreed during registration) or listing fees, which may be deducted from order payouts.</li><li>Maintain accurate and up-to-date menu information, including prices, availability, and descriptions.</li><li>Fulfill orders promptly and ensure food quality meets customer expectations.</li></ul>",
            "FoodyX reserves the right to reject or terminate restaurant registrations for non-compliance, false information, or failure to meet quality standards. Restaurants are responsible for any taxes or legal obligations arising from their operations.",
          ],
        },
        {
          title: "5. Delivery Terms",
          body: [
            "FoodyX facilitates food delivery through Delivery Personnel assigned based on order location and availability. Delivery terms include:",
            "<ul class='list-disc pl-6'><li><strong>Assignment</strong>: Orders are automatically assigned to Delivery Personnel using FoodyX’s algorithm, considering proximity and availability.</li><li><strong>Responsibilities</strong>: Delivery Personnel must deliver orders promptly, maintain food safety (e.g., proper packaging, temperature control), and communicate courteously with Customers.</li><li><strong>Tracking</strong>: Customers can track deliveries in real-time via the Platform. Delivery Personnel must enable location tracking during deliveries.</li><li><strong>Liability</strong>: FoodyX is not liable for delays, damaged orders, or accidents during delivery. Delivery Personnel are responsible for safe transport, and restaurants are responsible for food quality at pickup.</li><li><strong>Fees</strong>: Delivery fees are displayed at checkout and may vary based on distance or demand. Customers agree to pay these fees.</li></ul>",
            "Customers must provide accurate delivery addresses and be available to receive orders. FoodyX may charge additional fees for failed deliveries due to incorrect addresses or unavailability.",
          ],
        },
        {
          title: "6. User Accounts and Security",
          body: [
            "To access FoodyX, you must create an account with a valid email and password. Accounts are role-specific (Customer, Restaurant Admin, Delivery Personnel, Admin).",
            "<ul class='list-disc pl-6'><li>Maintain the confidentiality of your account credentials.</li><li>Notify FoodyX immediately of any unauthorized access or security breaches.</li><li>Access is restricted by role; unauthorized attempts may result in suspension.</li></ul>",
            "FoodyX employs industry-standard security, including encryption for payments and data. However, you are responsible for all activities under your account.",
          ],
        },
        {
          title: "7. Payments",
          body: [
            "FoodyX processes payments securely through trusted gateways, including PayHere, Dialog Genie, FriMi, Stripe, or PayPal (sandbox). By making a payment, you agree to:",
            "<ul class='list-disc pl-6'><li>Provide accurate payment information.</li><li>Pay all fees, including taxes, delivery, and service charges.</li><li>Comply with the payment gateway’s terms.</li></ul>",
            "FoodyX is not responsible for disputes, chargebacks, or errors caused by third-party gateways. Refunds are subject to the restaurant’s refund policy.",
          ],
        },
        {
          title: "8. Intellectual Property",
          body: [
            "All content on FoodyX, including logos, designs, text, and software, is owned by FoodyX Technologies or its licensors and protected by intellectual property laws. You may not reproduce or distribute it without written consent.",
            "Restaurant Admins grant FoodyX a non-exclusive, royalty-free license to display their menu items, images, and content for order fulfillment and promotion.",
          ],
        },
        {
          title: "9. User Responsibilities",
          body: [
            "All users agree to:",
            "<ul class='list-disc pl-6'><li>Provide accurate information for accounts, orders, and deliveries.</li><li>Comply with Sri Lankan laws, including food safety and business regulations.</li><li>Respect other users, including restaurants and Delivery Personnel.</li><li>Avoid posting false or harmful content (e.g., misleading reviews).</li></ul>",
            "Restaurant Admins must ensure menu accuracy, food quality, and timely order fulfillment. Delivery Personnel must deliver orders safely and promptly.",
          ],
        },
        {
          title: "10. Limitation of Liability",
          body: [
            "FoodyX is provided “as-is” and is not liable for:",
            "<ul class='list-disc pl-6'><li>Technical errors, delays, or service interruptions.</li><li>Inaccurate information provided by users or restaurants.</li><li>Issues with third-party services (e.g., payment gateways, SMS).</li><li>Food quality or safety, which is the restaurant’s responsibility.</li><li>Delivery accidents or delays, which are the Delivery Personnel’s responsibility.</li></ul>",
            "Our liability is limited to the order amount, as permitted by Sri Lankan law.",
          ],
        },
        {
          title: "11. Termination",
          body: [
            "FoodyX may suspend or terminate your account for violating these Terms, fraudulent activity, or misuse. Termination may cancel pending orders. You can delete your account by contacting support, subject to our Privacy Policy.",
          ],
        },
        {
          title: "12. Changes to Terms",
          body: [
            "FoodyX may update these Terms at any time. We will notify you via email, SMS, or the Platform. Continued use after changes constitutes acceptance of the new Terms.",
          ],
        },
        {
          title: "13. Governing Law",
          body: [
            "These Terms are governed by the laws of Sri Lanka. Any disputes will be resolved in the courts of Colombo, Sri Lanka.",
          ],
        },
        {
          title: "14. Contact Us",
          body: [
            "For questions or support, contact us at:",
            "<ul class='list-none pl-0'><li><strong>Email</strong>: <a href='mailto:support@foodyx.lk' class='text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300'>support@foodyx.lk</a></li><li><strong>Phone</strong>: +94 11 234 5678</li><li><strong>Address</strong>: FoodyX Technologies, 456 Flavor Road, Colombo 03, Sri Lanka</li></ul>",
          ],
        },
      ],
    },
    si: {
      title: "ෆූඩිඑක්ස් නියමයන් සහ කොන්දේසි",
      effectiveDate: "බලාත්මක වන දිනය: 2025 අප්‍රේල් 25",
      sections: [
        {
          title: "1. හැඳින්වීම",
          body: [
            "ෆූඩිඑක්ස් වෙත සාදරයෙන් පිළිගනිමු! ශ්‍රී ලංකාව පුරා පාරිභෝගිකයින් අවන්හල් සහ බෙදාහැරීමේ පුද්ගලයින් සමඟ සම්බන්ධ කරන ප්‍රමුඛ ආහාර ඇණවුම් හා බෙදාහැරීමේ වේදිකාවකි. මෙම නියමයන් සහ කොන්දේසි (“නියමයන්”) ෆූඩිඑක්ස් වේදිකාවේ භාවිතය, වෙබ් සහ ජංගම අතුරුමුහුණත්, ඇණවුම් සේවා, අවන්හල් කළමනාකරණ මෙවලම්, බෙදාහැරීමේ ක්‍රියාකාරකම් සහ ගෙවීම් පද්ධති ඇතුළුව පාලනය කරයි. ෆූඩිඑක්ස් භාවිතා කිරීමෙන් හෝ ප්‍රවේශ වීමෙන්, ඔබ මෙම නියමයන්ට බැඳී සිටීමට එකඟ වේ. ඔබ එකඟ නොවන්නේ නම්, කරුණාකර වේදිකාව භාවිතා නොකරන්න.",
            "ෆූඩිඑක්ස් ශ්‍රී ලංකාවේ සමාගමක් වන ෆූඩිඑක්ස් ටෙක්නොලොජීස් විසින් ක්‍රියාත්මක කරනු ලබන අතර, නවීන මයික්‍රෝසර්විසස් ගෘහ නිර්මාණ ශිල්පය ඔස්සේ ආරක්ෂිත හා බාධාවකින් තොර ආහාර අත්දැකීමක් ලබා දීමට කැපවී ඇත.",
          ],
        },
        {
          title: "2. නිර්වචන",
          body: [
            "<ul class='list-disc pl-6'><li><strong>පාරිභෝගික</strong>: අවන්හල් බ්‍රවුස් කරන, ඇණවුම් ලබා දෙන, බෙදාහැරීම් ලුහුබඳින, සහ ගෙවීම් කරන පරිශීලකයෙක්.</li><li><strong>අවන්හල් පරිපාලක</strong>: මෙනු කළමනාකරණය කරන, ඇණවුම් පිළිගන්නා, සහ ගෙවීම් හසුරුවන අවන්හල් හිමිකරු හෝ කළමනාකරු.</li><li><strong>බෙදාහැරීමේ පුද්ගලයින්</strong>: ෆූඩිඑක්ස් විසින් පවරන ලද බෙදාහැරීම් ඇණවුම් ඉටු කරන රියදුරෙක්.</li><li><strong>පරිපාලක</strong>: පරිශීලක ගිණුම්, අවන්හල් ලියාපදිංචි කිරීම් සත්‍යාපනය, සහ මූල්‍ය ගනුදෙනු අධීක්ෂණය කරන ෆූඩිඑක්ස් පරිපාලක.</li><li><strong>වේදිකාව</strong>: ෆූඩිඑක්ස් හි වෙබ් සහ ජංගම අතුරුමුහුණත්, API, සහ අදාළ සේවා.</li></ul>",
          ],
        },
        {
          title: "3. වේදිකා සේවා",
          body: [
            "ෆූඩිඑක්ස් පුළුල් සේවා රැසක් සපයයි, ඒවා ඇතුළත්:",
            "<ul class='list-disc pl-6'><li><strong>බ්‍රවුස් කිරීම සහ ඇණවුම් කිරීම</strong>: පාරිභෝගිකයින්ට අවන්හල් මෙනු ගවේෂණය කළ හැකි, අයිතම කරත්තයට එකතු කළ හැකි, ඇණවුම් ලබා දිය හැකි, සහ තහවුරු කිරීමට පෙර ඒවා වෙනස් කළ හැකිය.</li><li><strong>අවන්හල් කළමනාකරණය</strong>: අවන්හල් පරිපාලකයින්ට මෙනු අයිතම එකතු කිරීම, යාවත්කාලීන කිරීම, හෝ ඉවත් කිරීම, ලබා ගත හැකි බව සැකසීම, සහ ඇණවුම් කළමනාකරණය කළ හැකිය.</li><li><strong>බෙදාහැරීම</strong>: ඇණවුම් පිහිටීම සහ ලබා ගත හැකි බව මත පදනම්ව බෙදාහැරීමේ පුද්ගලයින්ට පවරනු ලැබේ, පාරිභෝගිකයින්ට තත්‍ය කාලීන ලුහුබැඳීම සමඟ.</li><li><strong>ගෙවීම්</strong>: ශ්‍රී ලංකා ගේට්වේ (PayHere, Dialog Genie, FriMi) හෝ ජාත්‍යන්තර සේවා (Stripe, PayPal sandbox) හරහා ආරක්ෂිත ගනුදෙනු.</li><li><strong>දැනුම්දීම්</strong>: පාරිභෝගිකයින්ට SMS සහ ඊමේල් හරහා ඇණවුම් තහවුරු කිරීම් ලැබේ; බෙදාහැරීමේ පුද්ගලයින්ට තත්‍ය කාලීන පැවරුම් දැනුම්දීම් ලැබේ.</li></ul>",
            "ඔබ මෙම නියමයන්ට අනුකූලව සහ නීත්‍යානුකූලව වේදිකාව භාවිතා කිරීමට එකඟ වේ.",
          ],
        },
        {
          title: "4. අවන්හල් ලියාපදිංචි කිරීම",
          body: [
            "ෆූඩිඑක්ස් හා එක්වීමට කැමති අවන්හල් ෆූඩිඑක්ස් පරිපාලකයින් විසින් සත්‍යාපනයට යටත්ව ලියාපදිංචි කිරීමේ ක්‍රියාවලියක් සම්පූර්ණ කළ යුතුය. ලියාපදිංචි වීමෙන්, අවන්හල් පරිපාලකයින් එකඟ වේ:",
            "<ul class='list-disc pl-6'><li>ව්‍යාපාරික බලපත්‍ර, මෙනු විස්තර, සහ සම්බන්ධතා තොරතුරු ඇතුළුව නිවැරදි සහ සම්පූර්ණ තොරතුරු සැපයීම.</li><li>ශ්‍රී ලංකා ආහාර ආරක්ෂණ සහ ව්‍යාපාරික රෙගුලාසිවලට අනුකූල වන බව සහතික කිරීම සඳහා ෆූඩිඑක්ස් විසින් සත්‍යාපනයට භාජනය වීම.</li><li>ලියාපදිංචි වීමේදී එකඟ වූ ලෙස වේදිකා කොමිස් හෝ ලැයිස්තුගත කිරීමේ ගාස්තු ඇතුළු ගාස්තු ගෙවීම, ඇණවුම් ගෙවීම්වලින් අඩු කළ හැකිය.</li><li>මිල, ලබා ගත හැකි බව, සහ විස්තර ඇතුළුව නිවැරදි සහ යාවත්කාලීන මෙනු තොරතුරු පවත්වා ගැනීම.</li><li>පාරිභෝගික අපේක්ෂාවන්ට ගැලපෙන ආහාර ගුණාත්මකභාවය සහතික කරමින් ඇණවුම් වහාම ඉටු කිරීම.</li></ul>",
            "ෆූඩිඑක්ස්ට අනුකූල නොවීම, ව්‍යාජ තොරතුරු, හෝ ගුණාත්මක ප්‍රමිතීන් සපුරාලීමට අපොහොසත් වීම සඳහා අවන්හල් ලියාපදිංචි කිරීම් ප්‍රතික්ෂේප කිරීමට හෝ අවසන් කිරීමට අයිතිය ඇත. අවන්හල් ඔවුන්ගේ මෙහෙයුම්වලින් ඇතිවන බදු හෝ නීතිමය වගකීම් සඳහා වගකිව යුතුය.",
          ],
        },
        {
          title: "5. බෙදාහැරීමේ නියමයන්",
          body: [
            "ෆූඩිඑක්ස් ඇණවුම් පිහිටීම සහ ලබා ගත හැකි බව මත පදනම්ව පවරන ලද බෙදාහැරීමේ පුද්ගලයින් හරහා ආහාර බෙදාහැරීම සපයයි. බෙදාහැරීමේ නියමයන් ඇතුළත්:",
            "<ul class='list-disc pl-6'><li><strong>පැවරුම</strong>: ෆූඩිඑක්ස් හි ඇල්ගොරිතම භාවිතා කරමින්, සමීපත්වය සහ ලබා ගත හැකි බව සලකා බලමින් ඇණවුම් ස්වයංක්‍රීයව බෙදාහැරීමේ පුද්ගලයින්ට පවරනු ලැබේ.</li><li><strong>වගකීම්</strong>: බෙදාහැරීමේ පුද්ගලයින් ඇණවුම් වහාම බෙදා හැරිය යුතුය, ආහාර ආරක්ෂාව (උදා: නිසි ඇසුරුම්කරණය, උෂ්ණත්ව පාලනය) පවත්වා ගත යුතුය, සහ පාරිභෝගිකයින් සමඟ ආචාරශීලීව සන්නිවේදනය කළ යුතුය.</li><li><strong>ලුහුබැඳීම</strong>: පාරිභෝගිකයින්ට වේදිකාව හරහා තත්‍ය කාලීනව බෙදාහැරීම් ලුහුබඳිය හැකිය. බෙදාහැරීමේ පුද්ගලයින් බෙදාහැරීම් අතරතුර ස්ථාන ලුහුබැඳීම සක්‍රිය කළ යුතුය.</li><li><strong>වගකීම</strong>: බෙදාහැරීමේදී ප්‍රමාද, හානි වූ ඇණවුම්, හෝ අනතුරු සඳහා ෆූඩිඑක්ස් වගකිව යුතු නොවේ. බෙදාහැරීමේ පුද්ගලයින් ආරක්ෂිත ප්‍රවාහනයට වගකිව යුතු අතර, එකතු කිරීමේදී ආහාර ගුණාත්මකභාවයට අවන්හල් වගකිව යුතුය.</li><li><strong>ගාස්තු</strong>: බෙදාහැරීමේ ගාස්තු චෙක්අවුට් හිදී ප්‍රදර්ශනය වන අතර, දුරස්ථභාවය හෝ ඉල්ලුම මත තරම් වෙනස් විය හැකිය. පාරිභෝගිකයින් මෙම ගාස්තු ගෙවීමට එකඟ වේ.</li></ul>",
            "පාරිතෝගිකයින් නිවැරදි බෙදාහැරීමේ ලිපිනයන් සැපයිය යුතු අතර, ඇණවුම් ලබා ගැනීමට ලබා ගත හැකි විය යුතුය. වැරදි ලිපිනයන් හෝ ලබා ගත නොහැකි වීම හේතුවෙන් අසාර්ථක බෙදාහැරීම් සඳහා ෆූඩිඑක්ස් අමතර ගාස්තු අය කළ හැකිය.",
          ],
        },
        {
          title: "6. පරිශීලක ගිණුම් සහ ආරක්ෂාව",
          body: [
            "ෆූඩිඑක්ස් වෙත ප්‍රවේශ වීමට, ඔබ වලංගු ඊමේල් ලිපිනයක් සහ මුරපදයක් සමඟ ගිණුමක් නිර්මාණය කළ යුතුය. ගිණුම් භූමිකාවට (පාරිභෝගික, අවන්හල් පරිපාලක, බෙදාහැරීමේ පුද්ගලයින්, පරිපාලක) විශේෂිත වේ.",
            "<ul class='list-disc pl-6'><li>ඔබේ ගිණුම් අක්තපත්‍රවල රහස්‍යභාවය පවත්වා ගන්න.</li><li>අනවසර ප්‍රවේශයක් හෝ ආරක්ෂක උල්ලංඝනයක් ගැන ෆූඩිඑක්ස් වහාම දැනුම් දෙන්න.</li><li>ප්‍රවේශය භූමිකාව අනුව සීමා කර ඇත; අනවසර උත්සාහයන් තාවකාලිකව අත්හිටුවීමට හේතු විය හැක.</li></ul>",
            "ෆූඩිඑක්ස් ගෙවීම් සහ දත්ත සඳහා සංකේතනය ඇතුළු කර්මාන්ත-ප්‍රමිති ආරක්ෂක ක්‍රම භාවිතා කරයි. කෙසේ වෙතත්, ඔබේ ගිණුම යටතේ සිදුවන සියලුම ක්‍රියාකාරකම් සඳහා ඔබ වගකිව යුතුය.",
          ],
        },
        {
          title: "7. ගෙවීම්",
          body: [
            "ෆූඩිඑක්ස් PayHere, Dialog Genie, FriMi, Stripe, හෝ PayPal (sandbox) ඇතුළු විශ්වාසනීය ගේට්වේ හරහා ගෙවීම් ආරක්ෂිතව සකසයි. ගෙවීමක් කිරීමෙන්, ඔබ එකඟ වේ:",
            "<ul class='list-disc pl-6'><li>නිවැරදි ගෙවීම් තොරතුරු සැපයීම.</li><li>බදු, බෙදාහැරීම, සහ සේවා ගාස්තු ඇතුළු සියලු ගාස්තු ගෙවීම.</li><li>ගෙවීම් ගේට්වේ සපයන්නාගේ නියමයන්ට අනුකූල වීම.</li></ul>",
            "තෙවන පාර්ශවීය ගේට්වේ හේතුවෙන් ඇතිවන ආරවුල්, ආපසු ගෙවීම්, හෝ දෝෂ සඳහා ෆූඩිඑක්ස් වගකිව යුතු නොවේ. ආපසු ගෙවීම් අවන්හලේ ආපසු ගෙවීමේ ප්‍රතිපත්තියට යටත් වේ.",
          ],
        },
        {
          title: "8. බුද්ධිමය දේපළ",
          body: [
            "ෆූඩිඑක්ස් හි සියලුම අන්තර්ගතය, ලාංඡන, මෝස්තර, පෙළ, සහ මෘදුකාංග ඇතුළුව, ෆූඩිඑක්ස් ටෙක්නොලොජීස් හෝ එහි බලපත්‍රලාභීන් සතු වන අතර, බුද්ධිමය දේපළ නීති මගින් ආරක්ෂා වේ. ලිඛිත එකඟතාවකින් තොරව ඔබට එය ප්‍රතිනිෂ්පාදනය හෝ බෙදා හැරීමට නොහැක.",
            "අවන්හල් පරිපාලකයින් ඇණවුම් ඉටු කිරීම සහ ප්‍රවර්ධනය සඳහා ඔවුන්ගේ මෙනු අයිතම, රූප, සහ අන්තර්ගතය ප්‍රදර්ශනය කිරීමට ෆූඩිඑක්ස්ට නො-විශේෂිත, රාජකීය රහිත බලපත්‍රයක් ලබා දෙයි.",
          ],
        },
        {
          title: "9. පරිශීලක වගකීම්",
          body: [
            "සියලුම පරිශීලකයින් එකඟ වේ:",
            "<ul class='list-disc pl-6'><li>ගිණුම්, ඇණවුම්, සහ බෙදාහැරීම් සඳහා නිවැරදි තොරතුරු සැපයීම.</li><li>ආහාර ආරක්ෂණ සහ ව්‍යාපාරික රෙගුලාසි ඇතුළු ශ්‍රී ලංකා නීතිවලට අනුකූල වීම.</li><li>අවන්හල් සහ බෙදාහැරීමේ පුද්ගලයින් ඇතුළු අනෙකුත් පරිශීලකයින්ට ගරු කිරීම.</li><li>ව්‍යාජ හෝ හානිකර අන්තර්ගතය (උදා: නොමඟ යවන සමාලෝචන) පළ කිරීමෙන් වැළකීම.</li></ul>",
            "අවන්හල් පරිපාලකයින් මෙනු නිවැරදි බව, ආහාර ගුණාත්මකභාවය, සහ ඇණවුම් වහාම ඉටු කිරීම සහතික කළ යුතුය. බෙදාහැරීමේ පුද්ගලයින් ඇණවුම් ආරක්ෂිතව සහ කාලෝචිතව බෙදා හැරිය යුතුය.",
          ],
        },
        {
          title: "10. වගකීම් සීමාව",
          body: [
            "ෆූඩිඑක්ස් “යථා තත්ත්වයෙන්” සපයනු ලබන අතර, පහත දැක්වෙන ඒවා සඳහා වගකිව යුතු නොවේ:",
            "<ul class='list-disc pl-6'><li>තාක්ෂණික දෝෂ, ප්‍රමාද, හෝ සේවා බාධා.</li><li>පරිශීලකයින් හෝ අවන්හල් විසින් සපයන වැරදි තොරතුරු.</li><li>තෙවන පාර්ශවීය සේවා (උදා: ගෙවීම් ගේට්වේ, SMS) සමඟ ගැටළු.</li><li>ආහාර ගුණාත්මකභාවය හෝ ආරක්ෂාව, එය අවන්හලේ වගකීමකි.</li><li>බෙදාහැරීමේ අනතුරු හෝ ප්‍රමාද, එය බෙදාහැරීමේ පුද්ගලයින්ගේ වගකීමකි.</li></ul>",
            "ශ්‍රී ලංකා නීතිය මගින් අවසර දී ඇති පරිදි, අපගේ වගකීම ඇණවුම් මුදලට සීමා වේ.",
          ],
        },
        {
          title: "11. අවසන් කිරීම",
          body: [
            "මෙම නියමයන් උල්ලංඝනය කිරීම, වංචාකාරී ක්‍රියාකාරකම්, හෝ වේදිකාව අනිසි ලෙස භාවිතා කිරීම සඳහා ෆූඩිඑක්ස් ඔබේ ගිණුම තාවකාලිකව අත්හිටුවීමට හෝ අවසන් කළ හැකිය. අවසන් කිරීමෙන් පොරොත්තු ඇණවුම් අවලංගු විය හැකිය. ඔබට අපගේ රහස්‍යතා ප්‍රතිපත්තියට යටත්ව සහාය අමතා ඔබේ ගිණුම ඉවත් කළ හැකිය.",
          ],
        },
        {
          title: "12. නියමයන් වෙනස් කිරීම",
          body: [
            "ෆූඩිඑක්ස්ට ඕනෑම වේලාවක මෙම නියමයන් යාවත්කාලීන කළ හැකිය. අපි ඔබට ඊමේල්, SMS, හෝ වේදිකාව හරහා දැනුම් දෙන්නෙමු. වෙනස්කම්වලින් පසුව භාවිතා කිරීමෙන් නව නියමයන් පිළිගැනීමක් ලෙස සලකනු ලැබේ.",
          ],
        },
        {
          title: "13. පාලන නීතිය",
          body: [
            "මෙම නියමයන් ශ්‍රී ලංකා නීති මගින් පාලනය වේ. ඕනෑම ආරවුලක් ශ්‍රී ලංකාවේ කොළඹ අධිකරණවලදී විසඳනු ලැබේ.",
          ],
        },
        {
          title: "14. අප හා සම්බන්ධ වන්න",
          body: [
            "ප්‍රශ්න හෝ සහාය සඳහා, අප හා සම්බන්ධ වන්න:",
            "<ul class='list-none pl-0'><li><strong>ඊමේල්</strong>: <a href='mailto:support@foodyx.lk' class='text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300'>support@foodyx.lk</a></li><li><strong>දුරකථන</strong>: +94 11 234 5678</li><li><strong>ලිපිනය</strong>: ෆූඩිඑක්ස් ටෙක්නොලොජීස්, 456 ෆ්ලේවර් පාර, කොළඹ 03, ශ්‍රී ලංකාව</li></ul>",
          ],
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setLanguage(language === "en" ? "si" : "en")}
            className="bg-orange-500 dark:bg-orange-400 text-white dark:text-gray-900 px-4 py-2 rounded-md hover:bg-orange-600 dark:hover:bg-orange-300 transition-colors text-sm font-medium"
          >
            {language === "en" ? "සිංහල" : "English"}
          </button>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-4">
            {content[language].title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {content[language].effectiveDate}
          </p>

          {content[language].sections.map((section, index) => (
            <section key={index} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {section.title}
              </h2>
              {section.body.map((paragraph, pIndex) => (
                <p
                  key={pIndex}
                  className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;