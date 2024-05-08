package co.boathouse.examples.angularspringboot.web.rest;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class BoathouseResource {

    private final Logger log = LoggerFactory.getLogger(BoathouseResource.class);

    private String boathouseApi;
    private String boathousePortalID;
    private String boathouseSecret;
    private WebClient webClient;

    public BoathouseResource() {
        this.boathouseApi = System.getenv("BOATHOUSE_API");
        this.boathousePortalID = System.getenv("BOATHOUSE_PORTAL_ID");
        this.boathouseSecret = System.getenv("BOATHOUSE_SECRET");
        this.webClient = WebClient.create();
    }

    @PostMapping("/dummylogin")
    public BoathouseResponse postDummyLogin(HttpServletResponse response) {
        // Generate a random email address

        UUID randomUUID = UUID.randomUUID();
        String randomUUIDString = randomUUID.toString();

        String randomEmailAddress = "playground-" + randomUUIDString + "@mailexample.com";

        BoathouseResponse boathouseResponse = this.getBoathouseResponse(randomEmailAddress, null, "http://localhost:8080").block();

        Cookie cookie = new Cookie("paddleCustomerId", boathouseResponse.paddleCustomerId);
        cookie.setPath("/");
        response.addCookie(cookie);

        return boathouseResponse;
    }

    @PostMapping("/boathouse")
    public BoathouseResponse postApi(@CookieValue(name = "paddleCustomerId", defaultValue = "") String paddlecustomerId)
        throws JsonProcessingException {
        if (paddlecustomerId.isEmpty()) {
            return null;
        }

        BoathouseResponse boathouseResponse = this.getBoathouseResponse(null, paddlecustomerId, "http://localhost:8080").block();

        ObjectMapper objectMapper = new ObjectMapper();

        log.info(boathouseResponse.paddleCustomerId);
        log.info(objectMapper.writeValueAsString(boathouseResponse));

        return boathouseResponse;
    }

    private Mono<BoathouseResponse> getBoathouseResponse(String email, String customerID, String returnUrl) {
        return webClient
            .post()
            .uri(boathouseApi)
            .body(BodyInserters.fromValue(new BoathouseRequest(boathousePortalID, boathouseSecret, email, customerID, returnUrl)))
            .retrieve()
            .bodyToMono(BoathouseResponse.class)
            .doOnNext(response -> log.info("Received response: {}", response))
            .onErrorResume(error -> {
                log.error("An unexpected error occurred: " + error.getMessage());
                return Mono.empty();
            });
    }

    private class BoathouseRequest {

        public String portalId;
        public String secret;
        public String email;
        public String paddleCustomerId;
        public String returnUrl;

        public BoathouseRequest(String portalId, String secret, String email, String paddleCustomerId, String returnUrl) {
            this.portalId = portalId;
            this.secret = secret;
            this.email = email;
            this.paddleCustomerId = paddleCustomerId;
            this.returnUrl = returnUrl;
        }
    }

    public static class BoathouseResponse {

        public String paddleCustomerId;
        public String billingPortalUrl;
        public String pricingTableHtml;
        public String pricingTableScript;
        public Object[] activeSubscriptions;
    }
}
