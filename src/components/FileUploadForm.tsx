import { Grid, Box, Typography, Button } from "@mui/material";

const FileUploadForm = ({ formData, handleFileChange, errors }) => {
  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between" p={3}>
      <Box flex="1 1 45%" mb={2}>
        <Typography variant="h6" gutterBottom color="black">
          Required Documents
        </Typography>
        <Typography variant="body2" color="gray" paragraph>
          Please upload the following required documents. Acceptable formats include PDF, JPEG, and PNG.
        </Typography>
      </Box>

      <Box flex="1 1 45%" mb={2} display="flex" flexDirection="column">
        <Typography variant="subtitle1" mb={1}>
          Secondary School Result
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "black", borderColor: "black" }}
        >
          {formData.secondarySchoolResultFile
            ? formData.secondarySchoolResultFile.name
            : "Upload Secondary School Result (e.g., WAEC, NECO)"}
          <input
            type="file"
            hidden
            name="secondarySchoolResultFile"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </Button>
        {errors.secondarySchoolResultFile && (
          <Typography color="error" variant="caption">
            Secondary school result is required
          </Typography>
        )}
      </Box>

      <Box flex="1 1 45%" mb={2}>
        <Typography variant="subtitle1" mb={1}>
          Birth Certificate
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "black", borderColor: "black" }}
        >
          {formData.birthCertificateFile
            ? formData.birthCertificateFile.name
            : "Upload Birth Certificate"}
          <input
            type="file"
            hidden
            name="birthCertificateFile"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </Button>
        {errors.birthCertificateFile && (
          <Typography color="error" variant="caption">
            Birth certificate is required
          </Typography>
        )}
      </Box>

      <Box flex="1 1 45%" mb={2}>
        <Typography variant="subtitle1" mb={1}>
          National ID
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "black", borderColor: "black" }}
        >
          {formData.nationalIdFile
            ? formData.nationalIdFile.name
            : "Upload National ID (e.g., NIN slip, Passport Data Page)"}
          <input
            type="file"
            hidden
            name="nationalIdFile"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </Button>
        {errors.nationalIdFile && (
          <Typography color="error" variant="caption">
            National ID is required
          </Typography>
        )}
      </Box>

      <Box flex="1 1 45%" mb={2}>
        <Typography variant="subtitle1" mb={1}>
          Primary School Leaving Certificate
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "black", borderColor: "black" }}
        >
          {formData.primaryCertificateFile
            ? formData.primaryCertificateFile.name
            : "Upload Primary Certificate"}
          <input
            type="file"
            hidden
            name="primaryCertificateFile"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </Button>
      </Box>

      <Box flex="1 1 45%" mb={2}>
        <Typography variant="subtitle1" mb={1}>
          Official High School Transcript (if any)
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "black", borderColor: "black" }}
        >
          {formData.transcriptFile
            ? formData.transcriptFile.name
            : "Upload Official High School Transcript (or college if applicable)"}
          <input
            type="file"
            hidden
            name="transcriptFile"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </Button>
      </Box>

      <Box flex="1 1 45%" mb={2}>
        <Typography variant="subtitle1" mb={1}>
          Personal Statement (optional)
        </Typography>
        <Button
          variant="outlined"
          component="label"
          sx={{ color: "black", borderColor: "black" }}
        >
          {formData.personalStatementFile
            ? formData.personalStatementFile.name
            : "Upload Personal Statement (500-1000 words)"}
          <input
            type="file"
            hidden
            name="personalStatementFile"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />
        </Button>
      </Box>
    </Box>
  );
};

export default FileUploadForm;
