const axios = require("axios");

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxm6QdUbnFJ56JLpV3va4k35g2opLvBTizAfBWgdgMk_4NWE0dbPonDT7Rc0dGTx68ywA/exec";

async function sendRegistrationEmail(
    parentEmail,
    studentName,
    parentName,
    groupCode,
    password,
    teamName,
    projectTitle,
    grade,
    division
) {

    try {

        console.log("======================================");
        console.log("📧 Sending email to:", parentEmail);
        console.log("======================================");

        const html = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f4f6f9;padding:30px;">

<div style="max-width:700px;margin:auto;background:white;padding:30px;border-radius:10px;">

<h1 style="color:#0B5394;">SPARK 4.0 Science Fair</h1>

<h2 style="color:green;">Registration Successful ✅</h2>

<p>Dear <b>${parentName}</b>,</p>

<p>Your ward has been successfully registered.</p>

<table cellpadding="8">

<tr>
<td><b>Student</b></td>
<td>${studentName}</td>
</tr>

<tr>
<td><b>Grade</b></td>
<td>${grade}-${division}</td>
</tr>

<tr>
<td><b>Team</b></td>
<td>${teamName}</td>
</tr>

<tr>
<td><b>Project</b></td>
<td>${projectTitle}</td>
</tr>

<tr>
<td><b>Registration Code</b></td>
<td><b>${groupCode}</b></td>
</tr>

<tr>
<td><b>Password</b></td>
<td><b>${password}</b></td>
</tr>

</table>

<br>

<a href="https://science-fair-6mvha62o7-auto-rah.vercel.app/dashboard"
style="background:#0B5394;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;">
Login Dashboard
</a>

<br><br>

<p>Please keep these credentials safe.</p>

</div>

</body>
</html>
`;

        const response = await axios.post(
            GAS_URL,
            {
                to: parentEmail,
                subject: "🏫 SPARK 4.0 Science Fair Registration",
                html: html
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ GAS Response:", response.data);

        return {
            success: true
        };

    } catch (err) {

        console.log("❌ GAS ERROR");

        if (err.response) {
            console.log(err.response.data);
        } else {
            console.log(err.message);
        }

        return {
            success: false,
            error: err.message
        };
    }
}

module.exports = {
    sendRegistrationEmail
};