"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Box,
  Skeleton,
  Divider,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  margin: "0 auto",
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(3),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const InfoSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
}));

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const userData = useQuery(api.users.getCurrentUser);
  const currentStudent = useQuery(api.students.getCurrentStudent);
  const currentTeacher = useQuery(api.teachers.getCurrentTeacher);

  if (!isLoaded) {
    return <ProfileSkeleton />;
  }

  // Get the appropriate ID based on role
  const getRoleSpecificId = () => {
    if (userData?.role === "student" && currentStudent) {
      return currentStudent.applicationNumber;
    }
    if (userData?.role === "teacher" && currentTeacher) {
      return currentTeacher.teacherId;
    }
    return null;
  };

  const roleSpecificId = getRoleSpecificId();

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
      <StyledCard>
        <CardHeader
          avatar={
            <StyledAvatar
              src={user?.imageUrl || undefined}
              alt={user?.fullName || "User"}
            >
              {user?.fullName?.[0] || "U"}
            </StyledAvatar>
          }
          title={
            <Typography variant="h4" component="div">
              {user?.fullName || "User"}
            </Typography>
          }
          subheader={
            <Typography
              variant="subtitle1"
              sx={{ textTransform: "capitalize", color: "primary.main" }}
            >
              {user?.primaryEmailAddress?.emailAddress || "No email"}
            </Typography>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <InfoSection>
                <Typography variant="h6" gutterBottom>
                  Role Information
                </Typography>
                <Typography variant="body1" sx={{ textTransform: "capitalize", color: "text.secondary" }}>
                  Role: {userData?.role || "User"}
                </Typography>
                {roleSpecificId && (
                  <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                    {userData?.role === "student" ? "Application" : "Teacher"} ID: {roleSpecificId}
                  </Typography>
                )}
                {userData?.role === "student" && currentStudent && (
                  <>
                    <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                      Program: {currentStudent.programName || "Not specified"}
                    </Typography>
                   
                  </>
                )}
                {userData?.role === "teacher" && currentTeacher && (
                  <>
                  
                    <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                      Courses: {currentTeacher.courseIds?.length || 0}
                    </Typography>
                  </>
                )}
              </InfoSection>
            </Box>
            <Box sx={{ flex: 1 }}>
              <InfoSection>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  Email: {user?.primaryEmailAddress?.emailAddress || "No email"}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                  Last Sign In: {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : "Never"}
                </Typography>
                {userData?.role === "student" && currentStudent && (
                  <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                    Level: {currentStudent.level || "Not specified"}
                  </Typography>
                )}
              </InfoSection>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
}

function ProfileSkeleton() {
  return (
    <Box sx={{ p: 3, maxWidth: "1200px", margin: "0 auto" }}>
      <StyledCard>
        <CardHeader
          avatar={<Skeleton variant="circular" width={120} height={120} />}
          title={<Skeleton variant="text" width={200} height={40} />}
          subheader={<Skeleton variant="text" width={100} height={24} />}
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={200} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rectangular" height={200} />
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </Box>
  );
} 
