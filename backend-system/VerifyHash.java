import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class VerifyHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$R.B7gghGZ/C7RzKlyqY3e.j3Qas0t7D6.pA6hM9p5V9Gvz0zV/r2a";
        System.out.println("Matches: " + encoder.matches("pwd", hash));
        System.out.println("New Hash for 'pwd': " + encoder.encode("pwd"));
    }
}
