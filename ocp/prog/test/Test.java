package test;
import java.util.stream.Stream;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.List;
import java.util.ArrayList;
import java.util.Locale;
import java.util.ResourceBundle;
import java.util.Properties;

import java.time.*;
import java.time.temporal.*;

import java.io.IOException;

public class Test {
  public static void main(String ...args) throws Exception {

    var rb = ResourceBundle.getBundle("Test", new Locale.Builder().setLanguage("en").build());

    hello();
  }

  private static void hello() {
    try {
      var duck = new Duck();
      duck.hello();
    } catch (IOException e) {
      
    }
  }

  static class Duck extends Animal {
    private int weight;

    public Duck() {
      super("Duck");
    }

    public Duck(String name, int weight) {
      super(name);
      this.weight = weight;
    }

    public int getWeight() { return weight; }

    public boolean hasWeight(Boolean check) {
      return check ? this.weight != 0 : false;
    }

    public void hello() {
      
    }
  }

  abstract static class Animal implements Comparable<Animal> {
    private String name;
    private static long counter = 1;

    public Animal() {
      this.name = "Animal" + this.counter++;
    }

    public Animal(String name) {
      this.name = name + this.counter++;
    }

    public String getName() { return name; }
    @Override
    public int compareTo(Animal d) {
      return name.compareTo(d.name);
    }

    @Override
    public String toString() {
      return name;
    }

    @Override
    public boolean equals(Object o) {
      return (o instanceof Animal) && this.name.equals(((Animal) o).name);
    }
  }
}


/*
    // 1) Which is a valid declaration:
    // - double d = 4.322D; (valid)
    // - int first = other, other = 15; (not valid)


    -- Comparable and Comparator interfaces
    var ducks = new HashSet<Duck>();
    ducks.add(new Duck("abb", 14));
    ducks.add(new Duck("cbb", 15));
    ducks.add(new Duck("cbb", 15));
    ducks.add(new Duck("dbb", 17));
    ducks.add(new Duck("Zbb", 15));
    Collections.sort(ducks, (x, y) -> x.name.compareTo(y.name));
    Collections.sort(ducks, Comparator.comparingInt((Duck x) -> x.weight).thenComparing((Duck x) -> x.name));
    Collections.sort(ducks, (d1, d2) -> d1.weight - d2.weight);
    System.out.println(ducks);


    -- Default functional interfaces
    
    Map<String, Duck> map = new TreeMap<>();

    BiPredicate<Duck, Boolean> biPredicate = Duck::hasWeight;
    Supplier<Duck> supplier = Duck::new;
    BiConsumer<String, Duck> biConsumer = map::put;

    var d1 = new Duck("labas", 1);
    var d2 = supplier.get();
    biConsumer.accept("chicken", biPredicate.test(d1, true) ? d1 : null);
    biConsumer.accept("chick", biPredicate.test(d2, false) ? d2 : null);

    System.out.println(map);

    var duck = new Duck("asdf", 15);
    Supplier<String> supplierDuckName = duck::getName;
    Supplier<Integer> supplierDuckWeight = duck::getWeight;
    System.out.println(supplierDuckName.get());
    System.out.println(supplierDuckWeight.get());


    Genrerics

    var baseDuck = new Duck("Duck2", 2);
    List<Integer> numbers = new ArrayList<>();
    List<Character> letters = new ArrayList<>();
    numbers.add(1);
    letters.add('a');
    StringBuilder builder = new StringBuilder();
    Stream<List<?>> good = Stream.of(numbers, letters);
    good.peek(builder::append).map(List::size).forEach(System.out::print);
    System.out.println(builder);
*/


/* INFO
<R> Stream<R> map(Function<? super T, ? extends R> mapper)
https://stackoverflow.com/questions/53755902/r-streamr-mapfunction-super-t-extends-r-mapper-stream
*/