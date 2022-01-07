public class Test {
  public static void main(String ...args) {
    var name = args.length > 0 ? args[0] : "Stranger";
    var lastLetter = name.substring(name.length() - 1);
    var greeting  = "a".equals(lastLetter) || "ė".equals(lastLetter) ? "Sveika" : "Sveikas";
    System.out.println(String.format("%s %s!", greeting, name));
  }
}