export const renderPaymentSuccessPage = (userName:string, userEmail:string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Integration Success</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  text-align: center;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  background-color: #fff;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              }
              h2 {
                  color: #277E16;
                  font-size: 24px;
                  margin-bottom: 20px;
              }
              p {
                  color: #555;
                  font-size: 16px;
                  line-height: 1.5;
                  margin-bottom: 20px;
              }
              .cta-button {
                  background-color: #277E16;
                  padding: 12px 20px;
                  color: #fff;
                  text-decoration: none;
                  font-size: 16px;
                  border-radius: 5px;
                  display: inline-block;
                  margin-top: 20px;
              }
              .cta-button:hover {
                  background-color: #1a5f0d;
              }
              footer {
                  margin-top: 40px;
                  font-size: 14px;
                  color: #777;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Success! Your Payment Integration Is Complete</h2>
              <p>Hi ${userName},</p>
              <p>We're excited to inform you that your payment integration has been successfully set up. You're now able to start accepting payments via Stripe!</p>
              <p>Your Stripe account is ready for use. Here’s what you can do next:</p>
              
              <h3>Next Steps:</h3>
              <ul style="text-align: left; color: #555; font-size: 16px; line-height: 1.5;">
              
                  <li>Start accepting payments from customers.</li>
                  <li>For any help or support, feel free to contact us.</li>
              </ul>

              <footer>
                  <p>If you have any questions, feel free to reach out to our support team
                   
                   </p>
                  <p>Thank you for choosing us! We’re excited to be part of your journey.</p>
              </footer>
          </div>
      </body>
      </html>
    `;
};

export const depositSuccessPage = (amount: any) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Success</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: white;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        .container h1 {
            font-size: 2.5rem;
            color: #28a745;
        }
        .container p {
            font-size: 1.2rem;
            color: #555;
        }
        .amount {
            font-size: 2rem;
            font-weight: bold;
            color: #28a745;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 1rem;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Payment Successful!</h1>
    <p>Thank you for your deposit. Your payment has been successfully processed.</p>
    
    <p>Your deposit amount: <span class="amount">$${amount}</span></p> <!-- Dynamic amount can be inserted here -->
    
    <p>Your account balance has been updated and is ready for use.</p>
    
    <!-- <a href="/dashboard" class="button">Go to Dashboard</a> Redirect to user's dashboard or another relevant page -->
</div>

</body>
</html>
`
export const PyamentCancel = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Canceled</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: white;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        .container h1 {
            font-size: 2.5rem;
            color: #dc3545;
        }
        .container p {
            font-size: 1.2rem;
            color: #555;
        }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 1rem;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Payment Canceled</h1>
    <p>Your payment has been canceled. You should try again.</p>
    
</div>

</body>
</html>
`