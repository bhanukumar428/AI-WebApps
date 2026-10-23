# AI-WebApps

\# Jai Veera Hanuman – Cashew Processor Trading \& Co.



A modern, responsive cashew trading and e-commerce web application designed to showcase cashew products, manage inventory and pricing, and simplify customer enquiries through WhatsApp.



\## 📌 Project Overview



\*\*Jai Veera Hanuman – Cashew Processor Trading \& Co.\*\* is a web application built to support retail and wholesale cashew trading. It provides a user-friendly product catalogue, a floating shopping cart, configurable pricing, an admin dashboard, and a WhatsApp-based order enquiry process.



The application allows administrators to manage products, stock, prices, retail pack sizes, offers, and business settings without manually modifying the frontend code for routine updates.



\## ✨ Key Features



\### Customer Features

\- Responsive design for desktop, tablet, and mobile devices.

\- Product catalogue with product images and details.

\- Retail product packs with configurable weights and prices.

\- Floating shopping cart with quantity controls.

\- Retail and wholesale pricing support.

\- Cart summary with product quantities and totals.

\- Customer details form for name, phone number, email, and address.

\- WhatsApp-based order enquiries for order confirmation.

\- Shipping and delivery charge display.

\- Configurable promotional offers and discounts.

\- Multiple selectable website themes.



\### Admin Dashboard

\- Secure admin login.

\- Add, edit, and remove products.

\- Upload and manage product images.

\- Manage product categories and stock availability.

\- Update inventory quantities.

\- Configure wholesale prices and tin weights.

\- Configure retail prices and retail pack sizes.

\- Manage shipping and delivery charges.

\- Configure GST and discount settings, where enabled.

\- Manage promotional offers and their visibility.

\- Configure the WhatsApp business contact number.

\- Track customer order enquiries.

\- View dashboard statistics and visitor information.

\- Export order records to Excel.



\### Order Enquiry Workflow

1\. Customers browse products and select their preferred pack sizes.

2\. Customers add products to the floating shopping cart.

3\. The cart displays quantities and the order total.

4\. Customers enter their contact and delivery details.

5\. The application prepares an order enquiry for WhatsApp.

6\. The business reviews the enquiry and confirms payment and order details separately.



\*\*Note:\*\* Opening WhatsApp does not automatically confirm an order or verify a payment.



\## 🛠️ Technology Stack



| Technology | Purpose |

|---|---|

| HTML5 | Application structure |

| CSS3 | Styling and responsive design |

| JavaScript | Frontend interactions and cart functionality |

| Node.js | Backend runtime |

| Express.js | Backend server and API routes |

| JSON file storage | Application data persistence |

| WhatsApp integration | Customer order enquiries |

| Git and GitHub | Version control and source code management |



\## 📁 Project Structure



The project follows a frontend-and-backend structure.



```text

Jai-Veera-Hanuman-Cashews/

├── src/

│   └── app.js

├── public/

│   ├── index.html

│   ├── admin-login.html

│   ├── js/

│   │   ├── app.js

│   │   ├── admin.js

│   │   └── admin-login.js

│   └── css/

│       └── style.css

├── private/

│   └── admin.html

├── data/

│   └── store.json

├── package.json

├── package-lock.json

├── .gitignore

└── README.md

```



\*Note: Update this structure to match the actual files and folders in your repository.\*



\## ⚙️ Prerequisites



\- Node.js and npm installed.

\- Git installed.

\- A modern web browser.

\- A WhatsApp account for handling customer enquiries.



\## 🚀 Installation and Setup



\### 1. Clone the repository



```bash

git clone YOUR\_GITHUB\_REPOSITORY\_URL

cd YOUR\_PROJECT\_FOLDER

```



Replace the repository URL and folder name with your actual details.



\### 2. Install dependencies



```bash

npm install

```



\### 3. Configure the application



Review the application's configuration and data files. Ensure that the required settings are configured through the admin dashboard or the deployment environment, depending on the implementation.



Do not commit passwords, session secrets, API keys, or other sensitive credentials.



\### 4. Start the application



Use the start script defined in `package.json`. If the project uses the standard `start` script, run:



```bash

npm start

```



For development, if a development script is configured:



```bash

npm run dev

```



\### 5. Open the application



Open the local URL printed by the server in your terminal. For example:



```text

http://localhost:3000

```



The port may differ depending on your application configuration.



\## ☁️ Deployment



The application can be deployed to a compatible Node.js hosting platform, such as Azure App Service or another Node.js hosting provider, after verifying the platform's requirements.



Before deploying, verify:



\- Node.js version compatibility.

\- Production start command.

\- Writable and persistent data storage.

\- Product image upload and storage behavior.

\- Session and admin authentication security.

\- HTTPS and application configuration.

\- Backup and recovery of business data.



\*\*Important:\*\* JSON files stored on the application filesystem may not be suitable for reliable production persistence on every hosting platform. Verify the hosting provider's filesystem behavior and backup requirements before relying on it for business data.



\## 🔐 Security Considerations



\- Keep credentials and secrets out of source control.

\- Protect admin routes and APIs with server-side authentication.

\- Use secure session settings and HTTPS in production.

\- Validate customer input and uploaded images.

\- Restrict upload file types and sizes.

\- Back up product, inventory, and enquiry data regularly.



\## 🛣️ Future Enhancements



\- Database integration for scalable data storage.

\- Online payment gateway integration.

\- Automated order status notifications.

\- Improved sales and inventory analytics.

\- Enhanced order management and reporting.

\- Automated backups and recovery.



\## 👨‍💻 Project Information



\*\*Project Name:\*\* Jai Veera Hanuman – Cashew Processor Trading \& Co.



\*\*Project Type:\*\* Full-stack web application



\*\*Primary Purpose:\*\* Cashew product catalogue, retail and wholesale pricing, inventory management, and WhatsApp-based order enquiries.



\*\*Repository:\*\* Add your GitHub repository URL here.



\## 📄 License



Add a license if you intend to distribute or reuse this project publicly. If this is a private business application, keep the repository private or choose a suitable license before making the source code public.



