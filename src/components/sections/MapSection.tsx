const MapSection = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Visit Our Store
          </h2>
          <p className="text-muted-foreground">
            Amla, Betul, Madhya Pradesh
          </p>
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg border border-border">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59062.03673977852!2d77.7699!3d21.9149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd6f3e09c5b5ecf%3A0x7b8e31f39dfe0f59!2sAmla%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1704067200000!5m2!1sen!2sin"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="PrintDukan Store Location - Amla, Betul, MP"
          />
        </div>
      </div>
    </section>
  );
};

export { MapSection };
