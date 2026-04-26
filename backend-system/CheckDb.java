
import java.sql.*;

public class CheckDb {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mariadb://localhost:3306/system_mgmt";
        String user = "itsm";
        String password = "itsm1234";
        
        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Checking service_request_attachments table:");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, file_name, file_size, LENGTH(file_data) FROM service_request_attachments")) {
                while (rs.next()) {
                    System.out.printf("ID: %d, Name: %s, Size: %d, Data Length: %d%n",
                        rs.getLong(1), rs.getString(2), rs.getLong(3), rs.getLong(4));
                }
            }
        }
    }
}
