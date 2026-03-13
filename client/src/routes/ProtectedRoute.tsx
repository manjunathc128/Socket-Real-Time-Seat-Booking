import { useSelector } from "react-redux"
import { RootState } from "@/redux/store";
import { Navigate } from "react-router-dom";
import { Container, Center, Loader } from "@mantine/core";

type ProtectedRouteProps = {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps )  => {

    const  { username, token } =  useSelector((state: RootState ) => state.auth)

    const isAuthenticated =  !!(username && token) 

    if (!isAuthenticated) return  (
    <Container>
        <Center h={500}>
            <Navigate  to="/login" replace  />
        </Center>
    </Container>
    )

    return (
        <>
         {children}
        </>
    )
}

export default ProtectedRoute