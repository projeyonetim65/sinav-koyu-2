import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(request: Request) {
  try {
    /*
     * ---------------------------------------------------------
     * SUPABASE ENVIRONMENT DEĞİŞKENLERİ
     * ---------------------------------------------------------
     */

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const secretKey =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !secretKey) {
      console.error(
        "Hesap silme API: Supabase server yapılandırması eksik."
      );

      return NextResponse.json(
        {
          error:
            "Hesap silme işlemi şu anda kullanılamıyor. Lütfen daha sonra tekrar dene.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * AUTHORIZATION HEADER
     * ---------------------------------------------------------
     */

    const authorization =
      request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json(
        {
          error:
            "Oturum doğrulanamadı. Lütfen tekrar giriş yap.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * BEARER TOKEN KONTROLÜ
     * ---------------------------------------------------------
     */

    if (
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error:
            "Geçersiz oturum bilgisi. Lütfen tekrar giriş yap.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization
        .slice(7)
        .trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Oturum bilgisi bulunamadı. Lütfen tekrar giriş yap.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * SUPABASE SERVER CLIENT
     * ---------------------------------------------------------
     *
     * SUPABASE_SECRET_KEY:
     *
     * - Sadece server tarafında kullanılır.
     * - Client tarafına gönderilmez.
     * - NEXT_PUBLIC_ ile başlamamalıdır.
     * - RLS bypass edebildiği için gizli tutulmalıdır.
     */

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        secretKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        }
      );

    /*
     * ---------------------------------------------------------
     * KULLANICIYI ACCESS TOKEN İLE DOĞRULA
     * ---------------------------------------------------------
     */

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      console.error(
        "Hesap silme: Kullanıcı doğrulanamadı.",
        userError?.message
      );

      return NextResponse.json(
        {
          error:
            "Oturum doğrulanamadı. Lütfen tekrar giriş yap.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * HESABI SİL
     * ---------------------------------------------------------
     */

    const {
      error: deleteError,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        user.id
      );

    if (deleteError) {
      console.error(
        "Supabase hesap silme hatası:",
        {
          message: deleteError.message,
          status: deleteError.status,
          name: deleteError.name,
        }
      );

      return NextResponse.json(
        {
          error:
            "Hesabın silinirken bir hata oluştu. Lütfen biraz sonra tekrar dene.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * BAŞARILI
     * ---------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Hesabın başarıyla silindi.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Hesap silme API beklenmeyen hata:",
      error instanceof Error
        ? error.message
        : error
    );

    return NextResponse.json(
      {
        error:
          "Hesap silme işlemi sırasında beklenmeyen bir hata oluştu. Lütfen biraz sonra tekrar dene.",
      },
      {
        status: 500,
      }
    );
  }
}