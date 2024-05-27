const express = require('express');
const bodyParser = require('body-parser');
const ORACLEDB  = require('oracledb');
const bcrypt = require('bcrypt');
const moment = require('moment'); // for timestamp handling
const nodemailer = require('nodemailer'); // for email sending (install with npm install nodemailer)
const exceljs = require('exceljs');
const url = require('url');
const crypto = require('crypto'); // Correct way to import
const OracleDB = require('oracledb');
const cors = require('cors');


const app = express();
const port = 3000; // Adjust the port as needed

// Database connection details (replace with your actual credentials)
const dbConfig = {
  user: 'mana0809',
  password: 'mana0809',
  connectString: "(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = exanode-x8m-ijztf-scan.allexadbclients.macomspokevcn.oraclevcn.com)(PORT = 1521))(CONNECT_DATA=(SERVER=DEDICATED) (SERVICE_NAME=MCPDB.allexadbclients.macomspokevcn.oraclevcn.com)(FAILOVER_MODE=(TYPE=select)(METHOD=basic))))"
};

// Connect to Oracle database using connection pool
OracleDB.createPool(dbConfig, (err, pool) => {
  if (err) {
    console.error('Error connecting to Oracle database:', err);
    process.exit(1); // Exit on error
  }

  console.log('Connected to Oracle database');

  app.use(bodyParser.json());
  app.use(cors({ origin: '*' }));
  

  // CORS configuration (replace with your allowed origin)
  // app.use((req, res, next) => {
  //   res.header('Access-Control-Allow-Origin', '*'); // Replace with your frontend origin
  //   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Adjust allowed headers if needed
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Adjust allowed methods if needed
  //   next();
  // });

  // Function to fetch user by email
async function getUserByEmail(email, connection) {
  const sql = `SELECT * FROM EMP_MASTER_88 WHERE useremail = :email`;
  const result = await connection.execute(sql, { email });

  if (result.rows.length === 0) {
    return null; // User not found
  }

  return result.rows[0];
}

// Function to update user password
async function updateUserPassword(userId, hashedPassword, connection) {
  const sql = `
    UPDATE EMP_MASTER_88
    SET password = :hashedPassword,
        password_reset_token = NULL,
        password_reset_expires = NULL
    WHERE id_seq = :userId
  `;

  await connection.execute(sql, {
    hashedPassword,
    userId
  });
}

  // API endpoint to register a new user
  app.post('/api/register', async (req, res) => {
    const user = req.body;
    console.log('Received data:', req.body);
    let connection;

    try {
      connection = await pool.getConnection();
      if (!connection) {
        throw new Error('Failed to acquire connection from pool');
      }
      const saltRounds = 10; // Adjust based on security requirements (higher = slower, more secure)
      const salt = await bcrypt.genSalt(saltRounds);

      // Hash the password using the salt
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const sql = `
        INSERT INTO EMP_MASTER_88 (
          username,
          password,
          useremail,
          id_seq
        ) VALUES (
          :username,
          :password,
          :useremail,
          emp_master_88_seq.NEXTVAL
        )
      `;
      console.log('connection:', sql);

      const binds = {
        username: user.username,
        password: hashedPassword,
        useremail: user.useremail
      };
      console.log(binds);

      const result = await connection.execute(sql, binds);
      // Log successful insert
      console.log(`Data inserted successfully: rows affected: ${result.rowsAffected}`);
      // Explicit commit after successful execution
      await connection.commit();

      if (result.rowsAffected === 1) {
        res.status(201).json({ message: 'Meeting data saved successfully' });
      } else {
        res.status(500).json({ message: 'Error saving meeting data' });
      }
    } catch (error) {
      console.error('Error saving meeting data:', error);
      // Rollback the transaction on error
      await connection.rollback();
      res.status(500).json({ message: 'Error saving meeting data' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing connection", error);
        }
      }
    }
  });
  app.use(cors({ origin: '*' }));
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    let connection;
    try {
        connection = await pool.getConnection();
  
        const sql = `SELECT * FROM EMP_MASTER_88 WHERE username = :username`;
        const result = await connection.execute(sql, { username });
  
        if (result.rows.length > 0) {
            const user = result.rows[0]; 
            const hashedPassword = user[2];
          console.log('Hashed password from database:', user.hashedPassword);
          console.log('User object:', user);
  
            // Compare the provided password with the hashed password from the database
            const isMatch = await bcrypt.compare(password, hashedPassword);
  
            if (isMatch) {
                // Successful login
                res.json({ message: 'Login successful' });
            } else {
                // Incorrect password
                res.status(401).json({ message: 'Invalid username or password' });
            }
        } else {
            // User not found
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error processing login:', error);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error("Error closing connection", error);
            }
        }
    }
  });

  app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    let connection;
    try {
      connection = await pool.getConnection();
  
      const sql = `SELECT * FROM EMP_MASTER_88 WHERE useremail = :email`;
      const result = await connection.execute(sql, { email });
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = result.rows[0];
  
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');
  
      // Set token expiration time (1 hour in milliseconds)
      const expiresAt = moment().add(1, 'hours').toDate();
  
      const updateSql = `
        UPDATE EMP_MASTER_88
        SET password_reset_token = :token,
            password_reset_expires = :expiresAt
        WHERE id_seq = :id
      `;
  
      await connection.execute(updateSql, {
        token,
        expiresAt,
        id: user.id_seq,
      });
  
      await connection.commit();
  
      // Send reset password email with the token
      const resetUrl = `http://localhost:4200/reset-password?token={${token}}`;
      // Configure email sending logic with the resetUrl
      const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // Adjust if using SSL/TLS
        auth: {
          user: 'vehiclefinance@manappuram.com',
          pass: 'VHef@998' // Replace with your credentials (store securely)
        }
      });
  
      const emailBody = `
        Click on the following link to reset your password:
        <a href="${resetUrl}">reset link</a>
  
        <br></br>
  
        If you did not request a password reset, please ignore this email.
      `;
  
      const emailOptions = {
        from: '"Your Application Name" <vehiclefinance@manappuram.com>',
        to: email,
        subject: 'Password Reset Request',
        html: emailBody
      };
  
      transporter.sendMail(emailOptions, (error, info) => {
        if (error) {
          console.error('Error sending password reset email:', error);
          res.status(500).json({ message: 'Error sending password reset email' });
        } else {
          console.log('Password reset instructions sent to email:', info.response);
          res.json({ message: 'Password reset instructions sent to your email' });
        }
      });

  
      res.json({ message: 'Password reset instructions sent to your email' });
    } catch (error) {
      console.error('Error processing forgot password:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing connection", error);
        }
      }
    }
  });
  
  // API endpoint to handle password reset

  app.use(cors({ origin: '*' }));
  app.post('/api/reset-password', async (req, res) => {
    // Validate request body for required properties
    if (!req.body.newPassword || !req.body.confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields: newPassword, confirmPassword' });
    }
  
    // Ensure passwords match
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
  
    // Extract token from query string using a safer approach
    const queryParams = new URLSearchParams(req.url.split('?')[1]);
    const token = queryParams.get('token');
  
    if (!token) {
      return res.status(400).json({ message: 'Missing token in request' });
    }
  
    try {
      // Parse token safely, handle potential errors
      const { email } = JSON.parse(atob(token));
  
      if (!email) {
        return res.status(400).json({ message: 'Invalid token format' });
      }
  
      let connection;
      try {
        connection = await pool.getConnection();
        if (!connection) {
          throw new Error('Failed to acquire connection from pool');
        }
  
        // Retrieve user data by email
        const user = await getUserByEmail(email, connection); // Call your function to fetch user by email
  
        if (!user) {
          return res.status(400).json({ message: 'Invalid or expired token' }); // User not found or token might be invalid
        }
  
        // Hash the new password
        const saltRounds = 10; // Adjust as needed
        const hashedPassword = await bcrypt.hash(req.body.newPassword, saltRounds);
  
        // Update the password in the database
        await updateUserPassword(user.id, hashedPassword, connection); // Call your function to update password
  
        // Send a confirmation email (optional)
        // ... (code to send email)
  
        return res.status(200).json({ message: 'Password reset successfully' });
      } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Error during password reset' });
      } finally {
        if (connection) {
          try {
            await connection.close();
          } catch (error) {
            console.error("Error closing connection", error);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      return res.status(400).json({ message: 'Invalid or malformed token' });
    }
  });

  app.post('/api/validate-token', async (req, res) => {
    const { token, email } = req.body;
  
    if (!token || !email) {
      return res.status(400).json({ message: 'Missing required fields: token, email' });
    }
  
    let connection;
    try {
      connection = await pool.getConnection();
  
      // Parse token safely, handle potential errors
      try {
        const { email: decodedEmail } = JSON.parse(atob(token));
        if (decodedEmail !== email) {
          return res.status(400).json({ message: 'Invalid or tampered token' });
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        return res.status(400).json({ message: 'Invalid or malformed token' });
      }
  
      // Retrieve user data by email
      const user = await getUserByEmail(email, connection);
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' }); // User not found or token might be invalid
      }
  
      // Check for token expiration (optional)
      // ... (implement logic to check if token expiration time has passed)
  
      res.json({ message: 'Token is valid' });
    } catch (error) {
      console.error('Error validating token:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing connection", error);
        }
      }
    }
  });
  
  app.post('/api/save-meeting', async (req, res) => {
    const meetingData = req.body;
    console.log('Received data:', req.body);
    let connection;
  
    try {
      connection = await pool.getConnection();
  
      const sql = `
        INSERT INTO MEETING88(
          name, emp_code, designation, state, day, attendees, performername, teamsize,
          department, product_name, meetingsubject, status
        ) VALUES (
          :name, :emp_code, :designation, :state, TO_DATE(:day,'YYYY-MM-DD'), :attendees, :performerName, :teamSize,
          :department, :productName, :meetingSubject, :status
        )
      `;
      console.log('connection:', sql);
  
      const binds = {
        name: meetingData.Name,
        emp_code: meetingData.emp_code,
        designation: meetingData.designation,
        state: meetingData.state,
        day: meetingData.day, // Adjust data type if needed (e.g., DATE)
        attendees: meetingData.Attendees,
        performerName: meetingData.performerName,
        teamSize: meetingData.TeamSize,
        department: meetingData.department,
        productName: meetingData.Product_Name,
        meetingSubject: meetingData.meetingsubject,
        status: meetingData.Status
      };
      console.log(binds);
  
      const result = await connection.execute(sql, binds);
      // Log successful insert
      console.log(`Data inserted successfully: rows affected: ${result.rowsAffected}`);
      // Explicit commit after successful execution
      
  
      if (result.rowsAffected === 1) {
        await connection.commit();
        res.status(201).json({ message: 'Meeting data saved successfully' });
      } else {
        res.status(500).json({ message: 'Error saving meeting data' });
      }
    } catch (error) {
      console.error('Error saving meeting data:', error);
      // Rollback the transaction on error
      await connection.rollback();
      res.status(500).json({ message: 'Error saving meeting data' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing connection", error);
        }
      }
    }
  });

  app.use(bodyParser.json());
// CORS configuration (replace with your allowed origin)
// app.use((req, res, next) => {
//  res.header('Access-Control-Allow-Origin', '*'); // Replace with your frontend origin
//  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Adjust allowed headers if needed
//  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Adjust allowed methods if needed
//  next();
// });
  app.get('/api/export-meetings', async (req, res) => {
    // Fetch data for export
    let connection;
    try {
      
      connection = await pool.getConnection();
      const sql = `SELECT * FROM MEETING88`;
      const result = await connection.execute(sql);
      const meetingData = result.rows;
  
      // Generate Excel file using exceljs
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Meetings');
  
      // Add headers
      worksheet.addRow(['Id','Emp Code','Designation','Name','STATE','DAY','ATTENDIES','PerformerName','TeamSize','Department','Product Name','Meeting Subject','Status',]);
  
      // Add meeting data to rows
      meetingData.forEach(row => {
        worksheet.addRow(row);
      });
  
      // Create a buffer to hold the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
  
      // Send the exported Excel file as a response
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=meetings.xlsx');
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Error exporting data' });
    } finally {
    }
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing connection", error);
        }
      }
    
  });

  app.get('/api/data', async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      const sql = `SELECT * FROM MEETING88`;
      const result = await connection.execute(sql);
      const meetings = result.rows.map(row => ({
        id: row[0],
        emp_code: row[1],
        designation: row[2],
        Name: row[3],
        state: row[4],
        day: row[5],
        Attendees: row[6],
        performerName: row[7],
        TeamSize: row[8],
        department: row[9],
        Product_Name: row[10],
        meetingsubject: row[11],
        Status: row[12],
       
      }));
      res.json(meetings);
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    } finally {
      if (connection) {
        try {
          await connection.close();
          console.log("\nThe connection has been closed.");
        } catch (err) {
          console.error(err);
        }
      }
    }
  });

  
  // API endpoint to get meeting details by ID
  app.get('/api/get-meeting-by-id/:meetingId', async (req, res) => {
    const meetingId = req.params.meetingId;
    const decodedToken = jwt.verify(req.headers.authorization.split(' ')[1], jwtSecret);
    let connection;

    try {
      connection = await pool.getConnection();

      if (!connection) {
        throw new Error('Failed to acquire connection from pool');
      }

      const sql = `
        SELECT * FROM PRM_MEETING WHERE  = PrmId:PrmId
      `;

      const binds = {
        PrmId : PrmId
      };

      const result = await connection.execute(sql, binds);

      if (result.rows.length > 0) {
        const meeting = result.rows[0];

        if (decodedToken.role === 'maker' || meeting.meeting_status === 'submitted') {
          res.status(200).json(meeting); // Allow maker to view all meetings, checker to view submitted ones
        } else {
          res.status(401).json({ message: 'Unauthorized access' });
        }
      } else {
        res.status(404).json({ message: 'Meeting not found' });
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
      res.status(500).json({ message: 'Error fetching meeting data' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error("Error closing connection", error);
        }
      }
    }
  });


  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
